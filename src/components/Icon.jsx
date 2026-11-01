import {
  Calendar, Crown, Dumbbell, Flame, HeartPulse, Moon, Sunrise, Timer, TrendingUp, Trophy, Users,
} from 'lucide-react'

// Maps icon names used in mock data to lucide components.
const map = { Calendar, Crown, Dumbbell, Flame, HeartPulse, Moon, Sunrise, Timer, TrendingUp, Trophy, Users }

export default function Icon({ name, ...props }) {
  const Cmp = map[name] ?? Dumbbell
  return <Cmp {...props} />
}
