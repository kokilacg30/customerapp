import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
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
    setState(() => _selectedIndex = index);
    context.go(_routes[index]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: Color(0xFF2A3540), width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: _onTap,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.access_time_outlined),
              activeIcon: Icon(Icons.access_time),
              label: 'History',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
