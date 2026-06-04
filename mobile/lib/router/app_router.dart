import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../screens/splash_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/booking/book_pickup_screen.dart';
import '../screens/booking/booking_address_screen.dart';
import '../screens/booking/booking_details_screen.dart';
import '../screens/booking/booking_confirm_screen.dart';
import '../screens/booking/booking_detail_screen.dart';
import '../screens/assigning/assigning_collector_screen.dart';
import '../screens/payment/payment_screen.dart';
import '../screens/tracking/tracking_screen.dart';
import '../screens/history/history_screen.dart';
import '../screens/rating/rating_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/profile/edit_profile_screen.dart';
import '../screens/profile/privacy_security_screen.dart';
import '../screens/profile/notifications_screen.dart';
import '../screens/profile/help_support_screen.dart';
import '../screens/profile/terms_service_screen.dart';
import '../screens/profile/about_screen.dart';
import '../models/booking_model.dart';

class AppRouter {
  static CustomTransitionPage _buildTransition(Widget child, LocalKey? key) {
    return CustomTransitionPage(
      key: key,
      child: child,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0.0, 0.05),
              end: Offset.zero,
            ).animate(CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutQuart,
            )),
            child: child,
          ),
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }

  static GoRouter createRouter(AuthProvider auth) {
    return GoRouter(
      initialLocation: '/splash',
      refreshListenable: auth,
      redirect: (context, state) {
        final isAuth = auth.isAuthenticated;
        final isInitializing = auth.isInitializing;
        final path = state.matchedLocation;

        if (isInitializing) return '/splash';

        if (path == '/splash') {
          return isAuth ? '/dashboard' : '/login';
        }

        final isAuthRoute = path == '/login' || path == '/register';

        if (!isAuth && !isAuthRoute) return '/login';
        if (isAuth && isAuthRoute) return '/dashboard';

        return null;
      },
      routes: [
        GoRoute(
          path: '/splash',
          pageBuilder: (_, state) => _buildTransition(const SplashScreen(), state.pageKey),
        ),
        GoRoute(
          path: '/login',
          pageBuilder: (_, state) => _buildTransition(const LoginScreen(), state.pageKey),
        ),
        GoRoute(
          path: '/register',
          pageBuilder: (_, state) => _buildTransition(const RegisterScreen(), state.pageKey),
        ),

        // Main shell with bottom nav
        ShellRoute(
          pageBuilder: (context, state, child) => _buildTransition(MainShell(child: child), state.pageKey),
          routes: [
            GoRoute(
              path: '/dashboard',
              pageBuilder: (_, state) => _buildTransition(const DashboardScreen(), state.pageKey),
            ),
            GoRoute(
              path: '/history',
              pageBuilder: (_, state) => _buildTransition(const HistoryScreen(), state.pageKey),
            ),
            GoRoute(
              path: '/profile',
              pageBuilder: (_, state) => _buildTransition(const ProfileScreen(), state.pageKey),
            ),
          ],
        ),

        // Booking flow
        GoRoute(
          path: '/book-pickup',
          pageBuilder: (_, state) => _buildTransition(const BookPickupScreen(), state.pageKey),
        ),
        GoRoute(
          path: '/booking-address',
          pageBuilder: (_, state) {
            final type = state.extra as String? ?? 'IMMEDIATE';
            return _buildTransition(BookingAddressScreen(type: type), state.pageKey);
          },
        ),
        GoRoute(
          path: '/booking-details',
          pageBuilder: (_, state) {
            final extra = state.extra as Map<String, dynamic>;
            return _buildTransition(BookingDetailsScreen(params: extra), state.pageKey);
          },
        ),
        GoRoute(
          path: '/booking-confirm',
          pageBuilder: (_, state) {
            final extra = state.extra as Map<String, dynamic>;
            return _buildTransition(BookingConfirmScreen(params: extra), state.pageKey);
          },
        ),
        GoRoute(
          path: '/assigning',
          pageBuilder: (_, state) {
            final bookingId = state.extra as String;
            return _buildTransition(AssigningCollectorScreen(bookingId: bookingId), state.pageKey);
          },
        ),
        GoRoute(
          path: '/payment',
          pageBuilder: (_, state) {
            final extra = state.extra as Map<String, dynamic>;
            return _buildTransition(
              PaymentScreen(
                bookingId: extra['bookingId'] as String,
                booking: extra['booking'] as BookingModel,
              ),
              state.pageKey,
            );
          },
        ),
        GoRoute(
          path: '/tracking',
          pageBuilder: (_, state) {
            final bookingId = state.extra as String;
            return _buildTransition(TrackingScreen(bookingId: bookingId), state.pageKey);
          },
        ),
        GoRoute(
          path: '/booking-detail',
          pageBuilder: (_, state) {
            final bookingId = state.extra as String;
            return _buildTransition(BookingDetailScreen(bookingId: bookingId), state.pageKey);
          },
        ),
        GoRoute(
          path: '/rating',
          pageBuilder: (_, state) {
            final bookingId = state.extra as String;
            return _buildTransition(RatingScreen(bookingId: bookingId), state.pageKey);
          },
        ),
        GoRoute(
          path: '/edit-profile',
          pageBuilder: (_, state) => _buildTransition(const EditProfileScreen(), state.pageKey),
        ),
        GoRoute(
          path: '/privacy',
          pageBuilder: (_, state) => _buildTransition(const PrivacySecurityScreen(), state.pageKey),
        ),
        GoRoute(
          path: '/notifications',
          pageBuilder: (_, state) => _buildTransition(const NotificationsScreen(), state.pageKey),
        ),
        GoRoute(
          path: '/help',
          pageBuilder: (_, state) => _buildTransition(const HelpSupportScreen(), state.pageKey),
        ),
        GoRoute(
          path: '/terms',
          pageBuilder: (_, state) => _buildTransition(const TermsServiceScreen(), state.pageKey),
        ),
        GoRoute(
          path: '/about',
          pageBuilder: (_, state) => _buildTransition(const AboutScreen(), state.pageKey),
        ),
      ],
    );
  }
}

class MainShell extends StatefulWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _selectedIndex = 0;

  static const _routes = ['/dashboard', '/history', '/profile'];

  void _onTap(int index) {
    if (_selectedIndex == index) return;
    HapticFeedback.lightImpact();
    setState(() => _selectedIndex = index);
    context.go(_routes[index]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          widget.child,
          // Floating Bottom Nav
          Positioned(
            left: 24,
            right: 24,
            bottom: 32,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(30),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                child: Container(
                  height: 64,
                  decoration: BoxDecoration(
                    color: const Color(0xFF161616).withOpacity(0.65),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: Colors.white.withOpacity(0.08), width: 1.5),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 30, offset: const Offset(0, 10)),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _NavItem(
                        icon: Icons.home_outlined,
                        activeIcon: Icons.home,
                        label: 'Home',
                        isSelected: _selectedIndex == 0,
                        onTap: () => _onTap(0),
                      ),
                      _NavItem(
                        icon: Icons.access_time_outlined,
                        activeIcon: Icons.access_time,
                        label: 'History',
                        isSelected: _selectedIndex == 1,
                        onTap: () => _onTap(1),
                      ),
                      _NavItem(
                        icon: Icons.person_outline,
                        activeIcon: Icons.person,
                        label: 'Profile',
                        isSelected: _selectedIndex == 2,
                        onTap: () => _onTap(2),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutQuart,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
              size: 24,
            ),
            if (isSelected) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  color: AppColors.primary,
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
