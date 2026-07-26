/**
 * Centralized icon registry.
 *
 * The rest of the app must import icons from here — never directly from
 * 'lucide-react'. This keeps every icon usage consistent (via <Icon />)
 * and gives us one place to add/replace icons as features grow.
 */
export { Icon, type IconProps } from './Icon'

export {
  // Navigation & chrome
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreVertical,
  Search,
  Settings,
  LogOut,
  User,
  Bell,
  Home,
  LayoutDashboard,
  FileText,
  PanelLeft,
  PanelLeftClose,
  Command,
  // Status & feedback
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  Loader2,
  // Data & analytics
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  // GIS / map
  MapPin,
  Map,
  Layers,
  Compass,
  Crosshair,
  Route,
  Filter,
  ZoomIn,
  ZoomOut,
  Locate,
  Ruler,
  Waves,
  Circle,
  Hexagon,
  Flame,
  Landmark,
  Tag,
  Building2,
  Users,
  Footprints,
  Accessibility,
  Sparkles,
  // Theme
  Sun,
  Moon,
  Monitor,
  // Misc
  Calendar,
  Download,
  Upload,
  ExternalLink,
  Copy,
  Trash2,
  Pencil,
  Plus,
  Minus,
  GripVertical,
  ArrowUp,
  ArrowDown,
  // Dashboard (Phase 7)
  Clock,
  Eye,
  GitCompare,
  RefreshCw,
  ArrowRight,
  SlidersHorizontal,
  ClipboardList,
} from 'lucide-react'