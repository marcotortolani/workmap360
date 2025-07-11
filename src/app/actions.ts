/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/actions.ts
'use server'

import webpush from 'web-push'

// Types para manejar las diferencias entre browser y web-push
interface WebPushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// Configure VAPID details
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@workmap360.com', // Cambia por tu email
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

// In production, use a database to store subscriptions
let subscriptions: WebPushSubscription[] = []

export async function subscribeUser(browserSubscription: any) {
  try {
    // Convert browser PushSubscription to web-push compatible format
    const webPushSubscription: WebPushSubscription = {
      endpoint: browserSubscription.endpoint,
      keys: {
        p256dh: browserSubscription.keys.p256dh,
        auth: browserSubscription.keys.auth,
      },
    }

    // Check if subscription already exists
    const existingIndex = subscriptions.findIndex(
      (sub) => sub.endpoint === webPushSubscription.endpoint
    )

    if (existingIndex >= 0) {
      // Update existing subscription
      subscriptions[existingIndex] = webPushSubscription
    } else {
      // Add new subscription
      subscriptions.push(webPushSubscription)
    }

    console.log(
      'User subscribed to push notifications:',
      webPushSubscription.endpoint
    )
    return {
      success: true,
      message: 'Successfully subscribed to notifications',
    }
  } catch (error) {
    console.error('Failed to subscribe user:', error)
    return { success: false, error: 'Failed to subscribe to notifications' }
  }
}

export async function unsubscribeUser(endpoint?: string) {
  try {
    if (endpoint) {
      // Remove specific subscription by endpoint
      subscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint)
    } else {
      // Clear all subscriptions (fallback)
      subscriptions = []
    }

    console.log('User unsubscribed from push notifications')
    return {
      success: true,
      message: 'Successfully unsubscribed from notifications',
    }
  } catch (error) {
    console.error('Failed to unsubscribe user:', error)
    return { success: false, error: 'Failed to unsubscribe from notifications' }
  }
}

export async function sendNotification(
  message: string,
  title: string = 'Workmap360'
) {
  if (subscriptions.length === 0) {
    console.log('No subscriptions available')
    return { success: false, error: 'No subscribers found' }
  }

  const payload = JSON.stringify({
    title,
    body: message,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'workmap360-notification',
    requireInteraction: false,
    data: {
      url: '/',
      timestamp: Date.now(),
    },
  })

  try {
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription, index) => {
        try {
          await webpush.sendNotification(subscription, payload)
          return { success: true, index }
        } catch (error: any) {
          console.error(
            `Failed to send notification to subscription ${index}:`,
            error
          )

          // Remove invalid subscriptions (410 = Gone, 413 = Payload too large)
          if (error.statusCode === 410 || error.statusCode === 413) {
            return { success: false, index, remove: true }
          }

          return { success: false, index, remove: false }
        }
      })
    )

    // Remove invalid subscriptions
    const invalidIndices = results
      .map((result, index) => ({ result, originalIndex: index }))
      .filter(
        ({ result }) =>
          result.status === 'fulfilled' &&
          result.value.success === false &&
          result.value.remove
      )
      .map(({ originalIndex }) => originalIndex)
      .sort((a, b) => b - a) // Sort in descending order to remove from end

    invalidIndices.forEach((index) => {
      subscriptions.splice(index, 1)
    })

    const successCount = results.filter(
      (result) => result.status === 'fulfilled' && result.value.success
    ).length

    console.log(
      `Notifications sent successfully to ${successCount}/${results.length} subscribers`
    )

    return {
      success: true,
      message: `Notification sent to ${successCount} subscribers`,
      sentCount: successCount,
      totalSubscribers: subscriptions.length,
    }
  } catch (error) {
    console.error('Error sending push notifications:', error)
    return { success: false, error: 'Failed to send notifications' }
  }
}

// Utility function to get subscription count
export async function getSubscriptionCount() {
  return {
    count: subscriptions.length,
    subscriptions: subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      // Don't return keys for security
    })),
  }
}

// Function to send notifications for specific events
export async function sendProjectNotification(
  projectName: string,
  message: string
) {
  return sendNotification(message, `Project: ${projectName}`)
}

export async function sendRepairNotification(
  repairCode: string,
  message: string
) {
  return sendNotification(message, `Repair: ${repairCode}`)
}

// Function to send welcome notification
export async function sendWelcomeNotification() {
  return sendNotification(
    'Welcome to Workmap360! You will receive notifications for important project updates.',
    'Welcome to Workmap360'
  )
}

// Function to broadcast notifications to all users
export async function broadcastNotification(
  message: string,
  title: string = 'System Notification'
) {
  return sendNotification(message, title)
}
