# 📚 Digital Library App – Server/Client with JavaFX & MySQL

This is a **Java client–server application** for managing a digital library.

* **Server JAR:** handles requests.
* **Client JAR:** provides a **JavaFX GUI**.
* **Quick login credentials** are included for testing — **no database required**.

---

## ⚙️ Runtime Requirements

Both the server and client require:

1. **JDK 23** (or newer)

   * Provides the Java runtime.
   * Verify with:

     ```bash
     java -version
     ```

2. **JavaFX SDK 23** (even for server)

   * Needed because the project is modular and compiled with JavaFX modules.
   * Download from [GluonHQ](https://gluonhq.com/products/javafx/)
   * Extract to a folder (e.g., `C:\javafx-sdk-23.0.1`)

3. Optional: **MySQL Server & Connector/J**

   * Only needed if you want database functionality.
   * For testing with hardcoded logins, **this is not required**.

---

## 🚀 Running the JARs

> ⚠️ On **PowerShell**, prefix the command with `&` when using paths with spaces.
> On **CMD**, you can run without `&`.

### 1. Start the Server

```powershell
& "C:\Program Files\Java\jdk-23\bin\java.exe" --module-path "C:\javafx-sdk-23.0.1\lib" --add-modules javafx.controls,javafx.fxml -jar G19_server.jar
```

Or if Java is in your PATH:

```bash
java --module-path "C:\javafx-sdk-23.0.1\lib" --add-modules javafx.controls,javafx.fxml -jar G19_server.jar
```

---

### 2. Start the Client

```powershell
& "C:\Program Files\Java\jdk-23\bin\java.exe" --module-path "C:\javafx-sdk-23.0.1\lib" --add-modules javafx.controls,javafx.fxml -jar G19_client.jar
```

Or if Java is in your PATH:

```bash
java --module-path "C:\javafx-sdk-23.0.1\lib" --add-modules javafx.controls,javafx.fxml -jar G19_client.jar
```

---

## 🔑 Quick Login Credentials

### Subscriber

* **ID:** `600123456`
* **Username:** `EthanT`
* **Password:** `EthanT2024`

### Librarian

* **Username:** `Mohamad`
* **Password:** `Mohamad`

> Enter these in the JavaFX login window. Subscriber ID is used internally.

---

## 🌐 Networking Notes

* Server binds to **all interfaces**: `0.0.0.0`.
* Local testing: Client connects to `localhost`.
* LAN testing: Client connects to the server’s **LAN IP** (e.g., `192.168.x.x`).
* Internet testing: **Port forwarding** needed + public IP.

---

## 📝 Notes

* **Start the server first**, then the client.
* Also open the cmd or powershell on the place the client and server downloaded on.
* Both JARs require the **module path for JavaFX**, even if the server does not show a GUI.
* `UnsupportedClassVersionError` → make sure you’re running **JDK 23**.
* `Unexpected token 'module-path'` in PowerShell → add `&` at the start of the command.
* MySQL is **optional** for testing; hardcoded login credentials work without it.

---

## 👤 Author

Developed by **Mohamad Atamneh**
[GitHub](https://github.com/MohamadAtamneh/My-Work) | [LinkedIn](https://linkedin.com/in/mohamad-atamleh-a43185381)


Do you want me to make that too?

