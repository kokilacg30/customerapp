import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';
import '../utils/app_constants.dart';

class ApiClient {
  static final Dio _dio = Dio(BaseOptions(
    baseUrl: AppConstants.apiUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json'},
  ));

  static bool _interceptorSetup = false;

  static Dio get instance {
    if (!_interceptorSetup) {
      _setupInterceptors();
      _interceptorSetup = true;
    }
    return _dio;
  }

  static void _setupInterceptors() {
    // Request: attach token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await SecureStorageService.getAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },

      // Response: handle token refresh on 401
      onError: (error, handler) async {
        if (error.response?.statusCode == 401 &&
            error.response?.data?['code'] == 'TOKEN_EXPIRED') {
          try {
            final refreshToken = await SecureStorageService.getRefreshToken();
            if (refreshToken == null) {
              handler.next(error);
              return;
            }

            final response = await Dio().post(
              '${AppConstants.apiUrl}/auth/refresh',
              data: {'refreshToken': refreshToken},
            );

            final newAccessToken = response.data['data']['accessToken'];
            final newRefreshToken = response.data['data']['refreshToken'];

            await SecureStorageService.saveTokens(
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            );

            // Retry original request
            error.requestOptions.headers['Authorization'] =
                'Bearer $newAccessToken';
            final retryResponse = await _dio.fetch(error.requestOptions);
            handler.resolve(retryResponse);
          } catch (_) {
            await SecureStorageService.clearTokens();
            handler.next(error);
          }
        } else {
          handler.next(error);
        }
      },
    ));

    // Logging in debug mode
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (o) => print('[API] $o'),
    ));
  }

  static String getErrorMessage(dynamic error) {
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map && data['message'] != null) {
        return data['message'] as String;
      }
      if (error.type == DioExceptionType.connectionTimeout) {
        return 'Connection timeout. Check your internet.';
      }
      if (error.type == DioExceptionType.connectionError) {
        return 'Cannot reach server. Check your connection.';
      }
    }
    return 'Something went wrong. Please try again.';
  }
}
