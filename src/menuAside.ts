import { mdiViewDashboard, mdiAccountGroup, mdiChartLine } from '@mdi/js'

export interface MenuAsideItem {
  to?: string
  href?: string
  target?: string
  icon?: string
  label: string
  color?: string
  isLogout?: boolean
  menu?: MenuAsideItem[]
}

export const menuAsideMain: MenuAsideItem[] = [
  {
    to: '/',
    icon: mdiViewDashboard,
    label: 'Home',
  },
  {
    to: '/life-groups',
    icon: mdiAccountGroup,
    label: 'Life Groups',
  },
  {
    to: '/attendance',
    icon: mdiChartLine,
    label: 'Attendance',
  },
]
