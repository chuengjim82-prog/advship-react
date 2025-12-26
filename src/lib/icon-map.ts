// Icon mapping from Ant Design icons to Lucide React icons
import {
  Home,
  Folder,
  MapPin,
  Building,
  DollarSign,
  Headphones,
  User,
  Users,
  Store,
  Rocket,
  Contact,
  Globe,
  Compass,
  Shield,
  FileCheck,
  List,
  Wrench,
  Settings,
  FileText,
  Percent,
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash,
  MoreHorizontal,
  Eye,
  Download,
  Upload,
  Copy,
  Check,
  X,
  AlertCircle,
  Info,
  Tags,
  Landmark,
  type LucideIcon,
} from 'lucide-react'

// Icon mapping object
export const iconMap: Record<string, LucideIcon> = {
  // Navigation icons
  HomeOutlined: Home,
  FolderOutlined: Folder,
  EnvironmentOutlined: MapPin,
  BankOutlined: Building,

  // Feature icons
  DollarOutlined: DollarSign,
  CustomerServiceOutlined: Headphones,
  UserOutlined: User,
  TeamOutlined: Users,
  ShopOutlined: Store,
  RocketOutlined: Rocket,
  ContactsOutlined: Contact,
  GlobalOutlined: Globe,
  CompassOutlined: Compass,
  SafetyOutlined: Shield,
  FileProtectOutlined: FileCheck,
  FileDoneOutlined: FileCheck,

  // System icons
  MenuOutlined: Menu,
  UnorderedListOutlined: List,
  ToolOutlined: Wrench,
  SettingOutlined: Settings,
  FileTextOutlined: FileText,
  PercentageOutlined: Percent,
  TagsOutlined: Tags,
  LandmarkOutlined: Landmark,

  // Action icons
  LeftOutlined: ChevronLeft,
  RightOutlined: ChevronRight,
  SearchOutlined: Search,
  PlusOutlined: Plus,
  ReloadOutlined: RefreshCw,
  EditOutlined: Edit,
  DeleteOutlined: Trash,
  EllipsisOutlined: MoreHorizontal,
  EyeOutlined: Eye,
  DownloadOutlined: Download,
  UploadOutlined: Upload,
  CopyOutlined: Copy,

  // Status icons
  CheckOutlined: Check,
  CloseOutlined: X,
  ExclamationCircleOutlined: AlertCircle,
  InfoCircleOutlined: Info,
}

// Helper function to get icon component by name
export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Info // Default to Info icon if not found
}
