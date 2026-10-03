# 십계명 메타버스 - 교사용 로컬 웹 서버 및 IP 자동 안내
import http.server
import socketserver
import socket
import webbrowser
import os

PORT = 8000

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 캐시 방지 헤더
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    local_ip = get_local_ip()
    url = f"http://{local_ip}:{PORT}"
    localhost_url = f"http://localhost:{PORT}"
    
    print("=" * 60)
    print(" [십계명 메타버스] 로컬 웹 서버가 실행되었습니다.")
    print(f" - 교사 PC 접속: {localhost_url}")
    print(f" - 학생 모바일 접속: {url}")
    print("=" * 60)
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n서버가 종료되었습니다.")
