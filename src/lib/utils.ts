import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format numbers with appropriate suffixes
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Format duration in minutes to human readable
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

// Format date relative to now
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ago`
  }
  if (hours > 0) {
    return `${hours}h ago`
  }
  if (minutes > 0) {
    return `${minutes}m ago`
  }
  return 'Just now'
}

// Calculate experience needed for next level
export function calculateExperienceForLevel(level: number): number {
  // Exponential growth: base 100 XP * level^1.5
  return Math.floor(100 * Math.pow(level, 1.5))
}

// Calculate current level from total experience
export function calculateLevelFromExperience(totalExperience: number): number {
  let level = 1
  let experienceNeeded = 0
  
  while (experienceNeeded <= totalExperience) {
    level++
    experienceNeeded += calculateExperienceForLevel(level)
  }
  
  return level - 1
}

// Get progress percentage for current level
export function calculateLevelProgress(experience: number, experienceToNext: number): number {
  return Math.min((experience / experienceToNext) * 100, 100)
}

// Generate a random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Debounce function for search and other operations
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }
}

// Throttle function for high-frequency events
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// Safely parse JSON with fallback
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // Remove data:type;base64, prefix
    }
    reader.onerror = error => reject(error)
  })
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch {
      document.body.removeChild(textArea)
      return false
    }
  }
}

// Get contrasting text color for background
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const color = hexColor.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// Generate random color
export function generateRandomColor(): string {
  const colors = [
    '#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B',
    '#EF4444', '#EC4899', '#84CC16', '#6366F1', '#14B8A6'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Calculate SAT score from raw score (approximate)
export function calculateSATScore(
  mathCorrect: number,
  mathTotal: number,
  readingCorrect: number,
  readingTotal: number
): {
  mathScore: number
  readingScore: number
  totalScore: number
} {
  // Simplified SAT scoring (actual scoring is more complex)
  const mathPercentage = mathCorrect / mathTotal
  const readingPercentage = readingCorrect / readingTotal
  
  // Scale to 200-800 range for each section
  const mathScore = Math.round(200 + (mathPercentage * 600))
  const readingScore = Math.round(200 + (readingPercentage * 600))
  
  return {
    mathScore,
    readingScore,
    totalScore: mathScore + readingScore
  }
}

// Calculate study streak
export function calculateStreak(studyDates: Date[]): number {
  if (studyDates.length === 0) return 0
  
  const sortedDates = studyDates
    .map(date => new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    .sort((a, b) => b.getTime() - a.getTime())
  
  let streak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Check if studied today or yesterday
  const lastStudy = sortedDates[0]
  const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff > 1) return 0 // Streak broken
  
  // Count consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i - 1]
    const previousDate = sortedDates[i]
    const diff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount)
}

// Get time zone
export function getTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// Check if device is mobile
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Get browser information
export function getBrowserInfo(): {
  name: string
  version: string
  os: string
} {
  const userAgent = navigator.userAgent
  
  let browserName = 'Unknown'
  let browserVersion = 'Unknown'
  let osName = 'Unknown'
  
  // Detect browser
  if (userAgent.includes('Chrome')) {
    browserName = 'Chrome'
    browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox'
    browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
  } else if (userAgent.includes('Safari')) {
    browserName = 'Safari'
    browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown'
  } else if (userAgent.includes('Edge')) {
    browserName = 'Edge'
    browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown'
  }
  
  // Detect OS
  if (userAgent.includes('Windows')) {
    osName = 'Windows'
  } else if (userAgent.includes('Mac')) {
    osName = 'macOS'
  } else if (userAgent.includes('Linux')) {
    osName = 'Linux'
  } else if (userAgent.includes('Android')) {
    osName = 'Android'
  } else if (userAgent.includes('iOS')) {
    osName = 'iOS'
  }
  
  return {
    name: browserName,
    version: browserVersion,
    os: osName
  }
}

// Local storage helpers with error handling
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch {
      return fallback
    }
  },
  
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
  
  clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch {
      return false
    }
  }
}

// Error handling utility
export function handleError(error: unknown, context?: string): string {
  let message = 'An unexpected error occurred'
  
  if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  }
  
  console.error(`Error${context ? ` in ${context}` : ''}:`, error)
  
  return message
}