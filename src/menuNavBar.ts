import { mdiLogout, mdiThemeLightDark } from '@mdi/js'

export interface MenuNavBarItem {
  to?: string
  href?: string
  target?: string
  icon?: string
  label?: string
  isCurrentUser?: boolean
  isDesktopNoLabel?: boolean
  isToggleLightDark?: boolean
  isLogout?: boolean
  isDivider?: boolean
  menu?: MenuNavBarItem[]
}

const menuNavBar: MenuNavBarItem[] = [
  {
    isCurrentUser: true,
    menu: [
      {
        icon: mdiThemeLightDark,
        label: 'Light/Dark',
        isToggleLightDark: true,
      },
      {
        isDivider: true,
      },
      {
        icon: mdiLogout,
        label: 'Sign out',
        isLogout: true,
      },
    ],
  },
]

export default menuNavBar
