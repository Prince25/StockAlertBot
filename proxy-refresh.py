import wget
import os
import re
import schedule
import time
import datetime

def get_proxies():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    url = 'https://proxy.webshare.io/proxy/list/download/iviiinjbywzslykjrfnxutejrrqvoyunqikxjgyn/-/http/username/direct/'
    filename = dir_path + '/' + 'config' + '/' + 'proxies.txt'

    if os.path.exists(filename):
        os.remove(filename)

    wget.download(url, out=filename) 


    pattern = re.compile("(^.*)(:)(afvlhykv:82ki6ps9x72t)")

    lines = open(filename, 'r').readlines()

    for i in range(len(lines)):
        proxy = re.search(pattern, lines[i])
        new_line = proxy.group(3) + '@' + proxy.group(1)
        lines[i] = new_line + '\n'

    out = open(filename, 'w')
    out.writelines(lines)
    out.close()

    print("\n[" + str(datetime.datetime.now()) + "] REFRESHED PROXY LIST")

get_proxies()

schedule.every(20).minutes.do(get_proxies)
while 1:
    schedule.run_pending()
    time.sleep(1)
