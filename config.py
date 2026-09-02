class config:
    SECRET_KEY = "Reyesm1304"
    DEBUG = True 

    class DevelopmentConfig(Config):
       mysql_host = "localhost"
       mysql_user = "root"  
       mysql_password = "mysql"
       mysql_db = "lumio"

       config - {
           "Development": Developmentconfig

       }
    }