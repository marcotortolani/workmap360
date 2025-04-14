"use client"

import { usePathname, useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MobileTabsProps {
  tabs: {
    value: string
    label: string
    href: string
  }[]
}

export function MobileTabs({ tabs }: MobileTabsProps) {
  const router = useRouter()
  const pathname = usePathname()

  const currentTab = tabs.find((tab) => pathname === tab.href)?.value || tabs[0].value

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white md:hidden">
      <Tabs
        value={currentTab}
        onValueChange={(value) => {
          const tab = tabs.find((t) => t.value === value)
          if (tab) {
            router.push(tab.href)
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-4">
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
    </div>
  )
}

