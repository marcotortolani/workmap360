// src/components/PWAManager.tsx - ACTUALIZADO
'use client'

import { useState, useEffect } from 'react'
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
  sendWelcomeNotification,
} from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Bell, BellOff, Download, Smartphone } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )
  const [message, setMessage] = useState('')
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for the app being installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      toast.success('Workmap360 installed successfully!', {
        description: 'You can now access the app from your home screen.',
      })
    })

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })

      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  async function subscribeToPush() {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready

      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        toast.error('Push notifications not configured')
        return
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      setSubscription(sub)

      // Convert subscription to serializable format
      const serializedSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey('p256dh')!),
          auth: arrayBufferToBase64(sub.getKey('auth')!),
        },
      }

      const result = await subscribeUser(serializedSub)

      if (result.success) {
        toast.success('Push notifications enabled!', {
          description:
            'You will now receive notifications for important updates.',
        })

        // Send welcome notification
        await sendWelcomeNotification()
      } else {
        toast.error(result.error || 'Failed to enable push notifications')
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      toast.error('Failed to enable push notifications')
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true)
    try {
      const endpoint = subscription?.endpoint
      await subscription?.unsubscribe()
      setSubscription(null)

      const result = await unsubscribeUser(endpoint)

      if (result.success) {
        toast.success('Push notifications disabled', {
          description: 'You will no longer receive push notifications.',
        })
      } else {
        toast.error(result.error || 'Failed to disable push notifications')
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      toast.error('Failed to disable push notifications')
    } finally {
      setIsLoading(false)
    }
  }

  async function sendTestNotification() {
    if (!subscription || !message.trim()) return

    setIsLoading(true)
    try {
      const result = await sendNotification(message)

      if (result.success) {
        setMessage('')
        toast.success('Test notification sent!', {
          description: `Sent to ${result.sentCount} subscribers`,
        })
      } else {
        toast.error(result.error || 'Failed to send notification')
      }
    } catch (error) {
      toast.error('Failed to send notification', {
        description: 'Error: ' + error,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    }
  }

  // Helper function to convert ArrayBuffer to base64
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    const binary = String.fromCharCode(...bytes)
    return window.btoa(binary)
  }

  if (!isSupported) {
    return (
      <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
        <p className="text-amber-800">
          Push notifications are not supported in this browser.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Smartphone className="h-5 w-5" />
        PWA Features
      </h3>

      {/* Install App */}
      {!isInstalled && deferredPrompt && (
        <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Install Workmap360</p>
              <p className="text-sm text-blue-700">
                Get the app experience on your device
              </p>
            </div>
            <Button
              onClick={handleInstallClick}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
          </div>
        </div>
      )}

      {isInstalled && (
        <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
          <p className="text-green-800 flex items-center gap-2">
            ✅ App is installed and running in standalone mode
          </p>
        </div>
      )}

      {/* Push Notifications */}
      <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Push Notifications
        </h4>

        {subscription ? (
          <div className="space-y-3">
            <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
              <p className="text-green-800 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                You are subscribed to push notifications
              </p>
            </div>

            <Button
              onClick={unsubscribeFromPush}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <BellOff className="h-4 w-4 mr-2" />
              {isLoading ? 'Processing...' : 'Disable Notifications'}
            </Button>

            {/* Test Notification */}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter test notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
              />
              <Button
                onClick={sendTestNotification}
                disabled={!message.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? 'Sending...' : 'Send Test Notification'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 border border-gray-200 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                Enable notifications to stay updated with project changes
              </p>
            </div>
            <Button
              onClick={subscribeToPush}
              className="w-full"
              disabled={isLoading}
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
