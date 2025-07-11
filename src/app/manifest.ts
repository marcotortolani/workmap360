// src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Workmap360',
    short_name: 'Workmap360',
    description: 'A Progressive Web App built with Next.js',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}



// import type { MetadataRoute } from 'next'

// export default function manifest(): MetadataRoute.Manifest {
//   return {
//     name: 'Workmap360 - Project Management',
//     short_name: 'Workmap360',
//     description: 'Complete project and repair management system for construction teams',
//     start_url: '/',
//     display: 'standalone',
//     background_color: '#ffffff',
//     theme_color: '#f97316', // Orange theme
//     orientation: 'portrait-primary',
//     categories: ['business', 'productivity', 'utilities'],
//     icons: [
//       // {
//       //   src: '/icon-72x72.png',
//       //   sizes: '72x72',
//       //   type: 'image/png',
//       //   purpose: 'maskable'
//       // },
//       // {
//       //   src: '/icon-96x96.png',
//       //   sizes: '96x96',
//       //   type: 'image/png',
//       //   purpose: 'maskable'
//       // },
//       // {
//       //   src: '/icon-128x128.png',
//       //   sizes: '128x128',
//       //   type: 'image/png',
//       //   purpose: 'maskable'
//       // },
//       // {
//       //   src: '/icon-144x144.png',
//       //   sizes: '144x144',
//       //   type: 'image/png',
//       //   purpose: 'maskable'
//       // },
//       // {
//       //   src: '/icon-152x152.png',
//       //   sizes: '152x152',
//       //   type: 'image/png',
//       //   purpose: 'maskable'
//       // },
//       {
//         src: '/icon-192x192.png',
//         sizes: '192x192',
//         type: 'image/png',
//         purpose: 'maskable'
//       },
//       // {
//       //   src: '/icon-384x384.png',
//       //   sizes: '384x384',
//       //   type: 'image/png',
//       //   purpose: 'maskable'
//       // },
//       {
//         src: '/icon-512x512.png',
//         sizes: '512x512',
//         type: 'image/png',
//         purpose: 'maskable'
//       },
//     ],
//     screenshots: [
//       {
//         src: '/screenshot-mobile.png',
//         sizes: '390x844',
//         type: 'image/png',
//         form_factor: 'narrow'
//       },
//       {
//         src: '/screenshot-desktop.png',
//         sizes: '1280x720',
//         type: 'image/png',
//         form_factor: 'wide'
//       }
//     ],
//     shortcuts: [
//       {
//         name: 'Dashboard',
//         short_name: 'Dashboard',
//         description: 'Go to main dashboard',
//         url: '/dashboard',
//         icons: [{ src: '/icon-96x96.png', sizes: '96x96' }]
//       },
//       {
//         name: 'Projects',
//         short_name: 'Projects',
//         description: 'Manage projects',
//         url: '/projects',
//         icons: [{ src: '/icon-96x96.png', sizes: '96x96' }]
//       },
//       {
//         name: 'New Repair',
//         short_name: 'New Repair',
//         description: 'Create new repair',
//         url: '/repairs/new',
//         icons: [{ src: '/icon-96x96.png', sizes: '96x96' }]
//       }
//     ]
//   }
// }

