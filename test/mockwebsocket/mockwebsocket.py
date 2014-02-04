#!/usr/bin/env python

import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
from tornado.options import define, options

define("port", default=8888, help="run on the given port", type=int)

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/ws", WebSocketHandler),
        ]
        tornado.web.Application.__init__(self, handlers);

class WebSocketHandler(tornado.websocket.WebSocketHandler):

    def allow_draft76(self):
		# for iOS 5.0 Safari
		return True
	
    def open(self):
		return True;

    def on_close(self):
		return True;

    def on_message(self, message):
        self.write_message(message)

def main():
    tornado.options.parse_command_line()
    app = Application()
    app.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()
