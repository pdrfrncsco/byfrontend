export interface NavLink {
  label: string
  href: string
  active?: boolean
}

export interface HeroContent {
  badge: string
  title: string
  highlightedText: string
  description: string
}

export interface FeatureCard {
  icon: string
  title: string
  description: string
  image?: string
}

export interface StatItem {
  value: string
  label: string
}

export interface PricingTier {
  name: string
  price: string
  currency: string
  period: string
  features: string[]
  buttonText: string
  highlighted?: boolean
}

export interface TestimonialItem {
  quote: string
  author: string
  title: string
  image?: string
}

export interface FAQItem {
  question: string
  answer: string
}
