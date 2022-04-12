import os
from threading import Timer
from dotenv import load_dotenv
import pyTigerGraph as tg
from datetime import datetime

load_dotenv()

class Interval(Timer):
    def run(self):
        while not self.finished.wait(self.interval):
            self.function(*self.args, **self.kwargs)

delay = 60 * 30 # 30 minutes

tg_host = os.environ.get("TG_HOST")
tg_secret = os.environ.get("TG_SECRET")
tg_graph = os.environ.get("TG_GRAPH")

def get_secret():
    tg.TigerGraphConnection(host=tg_host, graphname=tg_graph).getToken(tg_secret)[0]
    time = datetime.now().strftime("%m-%d-%y %H:%M:%S")
    print("{} : Retrieved secret".format(time))

# Run initial retrieval
get_secret()

t = Interval(delay, get_secret)
t.start()