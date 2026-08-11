import type { User } from '@/types'

export type DemoUser = User & {
  password: string
}

/** Demo household accounts for local development */
export const DEMO_USERS: DemoUser[] = [
  {
    id: 'user-ashton',
    name: 'Ashton',
    email: 'ashton@example.com',
    avatarInitials: 'AS',
    password: 'demo123',
  },
  {
    id: 'user-mom',
    name: 'Mom',
    email: 'mom@example.com',
    avatarInitials: 'MO',
    password: 'demo123',
  },
  {
    id: 'user-dad',
    name: 'Dad',
    email: 'dad@example.com',
    avatarInitials: 'DA',
    password: 'demo123',
  },
]

export function findDemoUserByEmail(email: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
}

export function toPublicUser(demo: DemoUser): User {
  return {
    id: demo.id,
    name: demo.name,
    email: demo.email,
    avatarInitials: demo.avatarInitials,
  }
}
