## Attendance Managment App

### Project setup using docker.

Install docker if not already install. On Windows you will need to enable Windows Subsystem for Linux (WSL2) in order to install docker. To install WSL2 run the following command in your Power Shell Terminal.

```bash
wsl --install
```

After installing WSL2, install docker from the following link: [Docker Desktop](https://desktop.docker.com/win/main/arm64/Docker%20Desktop%20Installer.exe?utm_source=docker&utm_medium=webreferral&utm_campaign=dd-smartbutton&utm_location=module&_gl=1*15bmtur*_gcl_au*OTU1ODU3NzA0LjE3MjcyNTg3Mzg.*_ga*NTgyMzYxMjc0LjE3MjcyNTg3Mzg.*_ga_XJWPQMJYHQ*MTcyNzI1ODczOC4xLjEuMTcyNzI1ODc0OC41MC4wLjA.). After installing docker navigate to the project directory. Run the following docker compose commadn to run the project.

```bash
docker compose up -d --build web

```

This command will build the docker image and run the project. To stop the project run the following command.

```bash
docker compose down
```

You can access the project on the following link: [http://localhost:8000/](http://localhost:3000/). You can access the database on the following link: [http://localhost:8080/](http://localhost:8080/). The database credentials are as follows:

```bash
Username: root
Password: password
```

## Project setup without docker.

To run the project without docker you will first need to install <strong>NodeJS</strong> and <strong>MariaDB</strong>. You can install NodeJS from the following link:
[NodeJS Download Link](https://nodejs.org/dist/v18.20.4/node-v18.20.4-x64.msi). You can install MariaDB from the following link: [MariaDB Link](https://mariadb.in.ssimn.org/mariadb-11.5.2/winx64-packages/mariadb-11.5.2-winx64.msi). After installing NodeJS and MariaDB navigate to the project directory. Run the following command to install the project dependencies.

```bash
npm install
```

To create tables in the database and put some dummy data run the following command.

```bash
npm run update-db
```

To reset the database run the following command.

```bash
npm run reset-db
```

To start the project run the following command.

```bash
npm run dev
```

## Running the API on android device.

To test companion android you will need to run the following command.

```bash
adb reverse tcp:3000 tcp:3000
```

For this to work you will need to install Android Studio. Add add adb to path. You can follow this guide to do so: [Add adb to path](https://medium.com/@yadav-ajay/a-step-by-step-guide-to-setting-up-adb-path-on-windows-0b833faebf18).
