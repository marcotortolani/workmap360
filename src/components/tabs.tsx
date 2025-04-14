'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TabsNavigationProps {
  tabs: {
    value: string
    label: string
    href: string
  }[]
  basePath: string
}

export function TabsNavigation({ tabs, basePath }: TabsNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const currentTab =
    tabs.find((tab) => pathname === tab.href)?.value || tabs[0].value

  return (
    <Tabs
      value={currentTab}
      onValueChange={(value) => {
        const tab = tabs.find((t) => t.value === value)
        if (tab) {
          router.push(tab.href)
        }
      }}
    >
      <TabsList
        className={` grid w-full max-w-md grid-rows-1 gap-1 border-b border-gray-200 bg-white p-1`}
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
        }}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
