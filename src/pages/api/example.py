from http.server import BaseHTTPRequestHandler, HTTPServer

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"hello": "world"}')
        return

server = HTTPServer(('', 8000), MyServer)
server.serve_forever()
print("Maybe the server is running.")