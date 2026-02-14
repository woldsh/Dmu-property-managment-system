// Route configuration mapping user roles to clean URLs
export interface RouteMapping {
    userRole: string;
    cleanUrl: string;
    displayName: string;
}

// Clean URL mappings for all user roles
export const ROUTE_MAPPINGS: RouteMapping[] = [
    // Managing Director & Chief
    { userRole: 'managing_director_leader', cleanUrl: '/portal', displayName: 'Portal' },
    { userRole: 'chief', cleanUrl: '/chief', displayName: 'Chief' },

    // General Service
    { userRole: 'general_service_leader', cleanUrl: '/service', displayName: 'Service' },

    // Academic Staff - Coordinator
    { userRole: 'academic_coordinator', cleanUrl: '/dashboard', displayName: 'Dashboard' },

    // Academic Staff - Department Heads
    { userRole: 'computer_science_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'agribusiness_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'accounting_finance_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'animal_science_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'economics_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'general_forestry_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'horticulture_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'management_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'natural_resource_management_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'peace_development_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'plant_science_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'veterinary_science_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'common_course_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },

    // Academic Staff - Teachers
    { userRole: 'computer_science_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'agribusiness_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'accounting_finance_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'animal_science_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'economics_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'general_forestry_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'horticulture_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'management_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'natural_resource_management_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'peace_development_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'plant_science_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'veterinary_science_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'common_course_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },

    // Procurement Management
    { userRole: 'procurement_team_leader', cleanUrl: '/workspace', displayName: 'Workspace' },
    { userRole: 'fixed_asset_stock_clerk', cleanUrl: '/workspace', displayName: 'Workspace' },
    { userRole: 'consumable_item_stock_clerk', cleanUrl: '/workspace', displayName: 'Workspace' },
    { userRole: 'fixed_asset_store_keeper', cleanUrl: '/workspace', displayName: 'Workspace' },
    { userRole: 'consumable_item_store_keeper', cleanUrl: '/workspace', displayName: 'Workspace' },

    // Admin Staff
    { userRole: 'hrm_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'HRM Leader' },
    { userRole: 'finance_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'Finance Leader' },
    { userRole: 'hrm_employee', cleanUrl: '/admin-panel', displayName: 'HRM Employee' },
    { userRole: 'finance_employee', cleanUrl: '/admin-panel', displayName: 'Finance Employee' },

    // Procurement Administration
    { userRole: 'procurement_admin_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'Procurement Admin Leader' },
    { userRole: 'procurement_admin_employee', cleanUrl: '/admin-panel', displayName: 'Procurement Admin Employee' },

    // Resource Development & Revenue
    { userRole: 'resource_development_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'Resource Development Leader' },
    { userRole: 'resource_development_employee', cleanUrl: '/admin-panel', displayName: 'Resource Development Employee' },

    // Building Renovation
    { userRole: 'building_renovation_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'Building Renovation Leader' },
    { userRole: 'building_renovation_employee', cleanUrl: '/admin-panel', displayName: 'Building Renovation Employee' },

    // General Service (Admin)
    { userRole: 'general_service_admin_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'General Service Leader' },
    { userRole: 'general_service_admin_employee', cleanUrl: '/admin-panel', displayName: 'General Service Employee' },

    // Library Service
    { userRole: 'library_service_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'Library Service Leader' },
    { userRole: 'library_service_employee', cleanUrl: '/admin-panel', displayName: 'Library Service Employee' },

    // Security
    { userRole: 'security_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'Security Leader' },
    { userRole: 'security_employee', cleanUrl: '/admin-panel', displayName: 'Security Employee' },

    // Registrar
    { userRole: 'registrar_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'Registrar Leader' },
    { userRole: 'registrar_employee', cleanUrl: '/admin-panel', displayName: 'Registrar Employee' },

    { userRole: 'student_service_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'Student Service Leader' },

    // Student Service - Dormitory
    { userRole: 'student_service_dormitory_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'Dormitory Leader' },
    { userRole: 'student_service_dormitory_employee', cleanUrl: '/admin-panel', displayName: 'Dormitory Employee' },

    // Student Service - Cafeteria
    { userRole: 'student_service_cafeteria_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'Cafeteria Leader' },
    { userRole: 'student_service_cafeteria_employee', cleanUrl: '/admin-panel', displayName: 'Cafeteria Employee' },

    // Student Service - Sport
    { userRole: 'student_service_sport_leader', cleanUrl: '/admin-staff/team-leader', displayName: 'Sport Leader' },
    { userRole: 'student_service_sport_employee', cleanUrl: '/admin-panel', displayName: 'Sport Employee' },

    // Generic Student Service
    { userRole: 'student_service_employee', cleanUrl: '/admin-panel', displayName: 'Student Service Employee' },
];

// Helper to check if a user is an employee
export function isEmployeeRole(userRole: string | null): boolean {
    if (!userRole) return false;
    return userRole.endsWith('_employee');
}

// Helper to check if a user is a leader
export function isLeaderRole(userRole: string | null): boolean {
    if (!userRole) return false;
    return userRole.endsWith('_leader') ||
        userRole === 'academic_coordinator' ||
        userRole.endsWith('_head') ||
        userRole === 'general_service_leader' ||
        userRole === 'managing_director_leader' ||
        userRole === 'chief';
}

// Helper function to handle formatting dynamic roles
function formatRoleName(role: string): string {
    return role
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Helper function to get clean URL for a user role
export function getCleanUrlForRole(userRole: string): string {
    const mapping = ROUTE_MAPPINGS.find(m => m.userRole === userRole);
    if (mapping) return mapping.cleanUrl;

    // Dynamic Fallback for Academic Staff
    if (userRole.endsWith('_head') || userRole.endsWith('_teacher')) {
        return '/dashboard';
    }

    // Dynamic Fallback for Admin Staff
    if (userRole.endsWith('_leader')) {
        return '/admin-staff/team-leader';
    }
    if (userRole.endsWith('_employee')) {
        return '/admin-panel';
    }

    return '/';
}

// Helper function to get display name for a user role
export function getDisplayNameForRole(userRole: string): string {
    const mapping = ROUTE_MAPPINGS.find(m => m.userRole === userRole);
    if (mapping) return mapping.displayName;

    // Dynamic Fallback
    if (userRole.endsWith('_head')) {
        return formatRoleName(userRole.replace('_head', '')); // e.g. "Physics"
    }
    if (userRole.endsWith('_teacher')) {
        return 'Dashboard';
    }
    if (userRole.endsWith('_leader')) {
        return formatRoleName(userRole.replace('_leader', '')) + ' Leader';
    }
    if (userRole.endsWith('_employee')) {
        return formatRoleName(userRole.replace('_employee', '')) + ' Employee';
    }

    return 'Home';
}

// Public routes that don't require authentication
export const PUBLIC_ROUTES = ['/', '/login'];

// Protected routes that require authentication
export const PROTECTED_ROUTES = ['/dashboard', '/portal', '/service', '/workspace', '/admin-panel', '/chief'];
