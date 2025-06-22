import { create } from 'zustand'
import { Role } from '@/types/database-types'

import {
  FolderKanban,
  UserCog,
  Users,
  Wrench,
  UserCircle,
  PenToolIcon,
  MapIcon,
  ListOrderedIcon,
  ChartBar,
} from 'lucide-react'

export interface NavProps {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

const NAV_TABS: {
  [key: string]: NavProps[]
} = {
  admin: [
    {
      title: 'Projects',
      href: '/dashboard/admin/projects',
      icon: FolderKanban,
    },
    {
      title: 'Roles',
      href: '/dashboard/admin/roles',
      icon: UserCog,
    },
    {
      title: 'Users',
      href: '/dashboard/admin/users',
      icon: Users,
    },
    {
      title: 'New Repair',
      href: '/dashboard/admin/new-repair',
      icon: PenToolIcon,
    },
    {
      title: 'Repairs',
      href: '/dashboard/admin/repairs',
      icon: Wrench,
    },
    {
      title: 'Repair Type',
      href: '/dashboard/admin/repair-type',
      icon: ListOrderedIcon,
    },
    {
      title: "Map's View",
      href: '/dashboard/admin/maps-view',
      icon: MapIcon,
    },
    {
      title: 'Reports',
      href: '/dashboard/admin/reports',
      icon: ChartBar,
    },
    {
      title: 'Profile',
      href: '/dashboard/admin/profile',
      icon: UserCircle,
    },
    // {
    //   title: 'Settings',
    // href: "/dashboard/admin/settings",
    //   icon: GearIcon,
    // },
    // {
    //   title: 'Logout',
    // href: "/dashboard/admin/logout",
    //   icon: 'logout',
    // },
  ],
  manager: [
    {
      title: 'Projects',
      href: '/dashboard/manager/projects',
      icon: FolderKanban,
    },
    {
      title: 'Roles',
      href: '/dashboard/manager/roles',
      icon: UserCog,
    },
    {
      title: 'Users',
      href: '/dashboard/manager/users',
      icon: Users,
    },
    {
      title: 'New Repair',
      href: '/dashboard/admin/new-repair',
      icon: PenToolIcon,
    },
    {
      title: 'Repairs',
      href: '/dashboard/manager/repairs',
      icon: Wrench,
    },
    {
      title: 'Repair Type',
      href: '/dashboard/manager/repair-type',
      icon: ListOrderedIcon,
    },
    {
      title: "Map's View",
      href: '/dashboard/manager/maps-view',
      icon: MapIcon,
    },
    {
      title: 'Reports',
      href: '/dashboard/manager/reports',
      icon: ChartBar,
    },
    {
      title: 'Profile',
      href: '/dashboard/manager/profile',
      icon: UserCircle,
    },
    // {
    //   title: 'Settings',
    // href: "/dashboard/manager/settings",
    //   icon: 'gear',
    // },
    // {
    //   title: 'Logout',
    // href: "/dashboard/manager/logout",
    //   icon: 'logout',
    // },
  ],
  technician: [
    {
      title: 'Projects',
      href: '/dashboard/technician/projects',
      icon: FolderKanban,
    },
    {
      title: 'New Repair',
      href: '/dashboard/technician/new-repair',
      icon: PenToolIcon,
    },
    {
      title: 'Repairs',
      href: '/dashboard/technician/repairs',
      icon: Wrench,
    },
    {
      title: "Map's View",
      href: '/dashboard/technician/maps-view',
      icon: MapIcon,
    },
    {
      title: 'Profile',
      href: '/dashboard/technician/profile',
      icon: UserCircle,
    },
  ],
  client: [
    {
      title: 'Projects',
      href: '/dashboard/client/projects',
      icon: FolderKanban,
    },
    {
      title: 'Repairs',
      href: '/dashboard/client/repairs',
      icon: Wrench,
    },
    {
      title: "Map's View",
      href: '/dashboard/client/maps-view',
      icon: MapIcon,
    },
    {
      title: 'Profile',
      href: '/dashboard/client/profile',
      icon: UserCircle,
    },
  ],
  guest: [
    {
      title: 'Projects',
      href: '/dashboard/guest/projects',
      icon: FolderKanban,
    },
    {
      title: 'Repairs',
      href: '/dashboard/guest/repairs',
      icon: Wrench,
    },
    {
      title: 'Profile',
      href: '/dashboard/guest/profile',
      icon: UserCircle,
    },
  ],
}

type TabsNavStore = {
  tabsNavItems: NavProps[]
  setTabsNavItems: (role: Role) => void
}

export const useTabsNavStore = create<TabsNavStore>((set) => ({
  tabsNavItems: [],
  setTabsNavItems: (role: Role) => set({ tabsNavItems: NAV_TABS[role] }),
}))
