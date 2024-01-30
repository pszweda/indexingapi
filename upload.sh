ssh -tt cyberstudio@176.119.33.195 << CON
        cd /home/cyberstudio/html/cust1019/indexingApi
        
        
        logout
CON

scp -r ./* cyberstudio@176.119.33.195:/home/cyberstudio/html/cust1019/indexingApi