import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../storage/secure_storage.dart';
import '../utils/app_constants.dart';

typedef EventCallback = void Function(dynamic data);

class SocketService {
  static IO.Socket? _socket;
  static bool _connected = false;

  static bool get isConnected => _connected;

  static Future<void> connect() async {
    if (_connected) return;

    final token = await SecureStorageService.getAccessToken();
    if (token == null) return;

    _socket = IO.io(
      AppConstants.baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(2000)
          .build(),
    );

    _socket!.onConnect((_) {
      _connected = true;
      print('🔌 Socket connected: ${_socket!.id}');
    });

    _socket!.onDisconnect((_) {
      _connected = false;
      print('🔌 Socket disconnected');
    });

    _socket!.onConnectError((e) {
      print('🔌 Socket error: $e');
    });

    _socket!.connect();
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _connected = false;
  }

  static void joinBookingRoom(String bookingId) {
    _socket?.emit('join_booking_room', {'bookingId': bookingId});
  }

  static void leaveBookingRoom(String bookingId) {
    _socket?.emit('leave_booking_room', {'bookingId': bookingId});
  }

  static void on(String event, EventCallback callback) {
    _socket?.on(event, callback);
  }

  static void off(String event) {
    _socket?.off(event);
  }

  static void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }
}
