<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { ChevronRight, type LucideIcon } from "lucide-vue-next";
import { RouterLink } from "vue-router";

defineProps<{
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    class?: string;
    items?: {
      title: string;
      url: string;
      isActive?: boolean;
    }[];
  }[];
}>();
</script>

<template>
  <SidebarGroup>
    <SidebarMenu>
      <template v-for="item in items" :key="item.title">
        <!-- Collapsible item (has sub-items) -->
        <Collapsible
          v-if="item.items && item.items.length"
          as-child
          :open="!!item.isActive"
          class="group/collapsible">
          <SidebarMenuItem>
            <!-- Parent row -->
            <CollapsibleTrigger as-child>
              <SidebarMenuButton :tooltip="item.title" as-child>
                <!-- ✅ Parent clickable -->
                <RouterLink
                  :to="item.url"
                  class="flex items-center gap-3 w-full hover:bg-white/10 px-3 py-2 rounded transition-colors"
                  :class="item.isActive ? 'bg-white/20' : ''">
                  <component
                    :is="item.icon"
                    v-if="item.icon"
                    class="w-5 h-5 shrink-0"
                    :class="item.isActive ? 'text-white' : 'text-white/80'" />
                  <span
                    class="truncate"
                    :class="[
                      item.isActive
                        ? 'text-white font-medium'
                        : 'text-white/80',
                      item.class,
                    ]">
                    {{ item.title }}
                  </span>

                  <ChevronRight
                    class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 w-4 h-4 shrink-0 text-white/80" />
                </RouterLink>
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <!-- Sub-items -->
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem
                  v-for="subItem in item.items"
                  :key="subItem.title">
                  <SidebarMenuSubButton as-child>
                    <RouterLink
                      :to="subItem.url"
                      class="px-2 py-1 block rounded transition-colors truncate"
                      :class="
                        subItem.isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      ">
                      <span :class="item.class">{{ subItem.title }}</span>
                    </RouterLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        <!-- Regular item (no sub-items) -->
        <SidebarMenuItem v-else>
          <SidebarMenuButton :tooltip="item.title" as-child>
            <RouterLink
              :to="item.url"
              class="flex items-center gap-3 w-full hover:bg-white/10 px-3 py-2 rounded transition-colors group"
              :class="
                item.isActive ? 'bg-white/20 text-white' : 'text-white/80'
              ">
              <component
                :is="item.icon"
                v-if="item.icon"
                class="w-5 h-5 shrink-0"
                :class="
                  item.isActive
                    ? 'text-white'
                    : 'text-white/80 group-hover:text-white'
                " />
              <span
                class="truncate transition-opacity duration-200"
                :class="[
                  item.isActive
                    ? 'text-white font-medium'
                    : 'text-white/80 group-hover:text-white',
                  item.class,
                  'group-data-[collapsible=icon]/sidebar:opacity-0',
                ]">
                {{ item.title }}
              </span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>

<style scoped>
.khmer-text {
  font-family: "Khmer OS Battambang", "Khmer OS", sans-serif;
  line-height: 1.6;
}
</style>
