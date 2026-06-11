# 🏆 Polla Mundialista · Familia Rivera Arcos

Instrucciones paso a paso para publicar la app en internet (gratis).

---

## Paso 1 — Crear la Google Sheet

1. Abre [Google Sheets](https://sheets.google.com) y crea un nuevo archivo. Llámalo **"Polla Familia Rivera"**.
2. Crea **tres hojas** con estos nombres exactos (haz clic en "+" abajo):
   - `jugadores`
   - `pronosticos`
   - `resultados`
3. En cada hoja, escribe los **encabezados en la fila 1** (una columna por celda):

   **jugadores:**
   | email | nombre | password_hash | created_at |

   **pronosticos:**
   | email | partido_id | goles_local | goles_visitante | updated_at |

   **resultados:**
   | partido_id | goles_local | goles_visitante | cerrado |

4. **Copia la URL de la hoja** y extrae el ID. La URL tiene esta forma:
   `https://docs.google.com/spreadsheets/d/ESTO_ES_EL_ID/edit`
   El ID es la parte entre `/d/` y `/edit`.

---

## Paso 2 — Crear la Cuenta de Servicio de Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com).
2. Crea un proyecto nuevo (o usa uno existente).
3. Ve a **APIs y servicios → Biblioteca** y activa la **Google Sheets API**.
4. Ve a **APIs y servicios → Credenciales**.
5. Haz clic en **+ Crear credenciales → Cuenta de servicio**.
6. Dale un nombre (ej: `polla-rivera`) y haz clic en **Crear y continuar → Listo**.
7. Haz clic en la cuenta de servicio recién creada.
8. Ve a la pestaña **Claves → Agregar clave → Crear clave nueva → JSON**.
9. Descarga el archivo JSON. Tiene este aspecto:
   ```json
   {
     "client_email": "polla-rivera@tu-proyecto.iam.gserviceaccount.com",
     "private_key": "-----BEGIN PRIVATE KEY-----\n..."
   }
   ```
10. **Comparte tu Google Sheet** con el `client_email` de la cuenta de servicio (botón "Compartir", rol Editor).

---

## Paso 3 — Subir el código a GitHub

1. Si no tienes cuenta en [GitHub](https://github.com), créala gratis.
2. Crea un repositorio nuevo (privado si quieres).
3. Sube todos los archivos de esta carpeta al repositorio.
   - Opción fácil: arrastra la carpeta al repositorio en el navegador.
   - Opción técnica: `git init`, `git add .`, `git commit -m "init"`, `git push`.

---

## Paso 4 — Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta gratuita (puedes entrar con GitHub).
2. Haz clic en **Add New → Project** y selecciona tu repositorio de GitHub.
3. En la configuración, haz clic en **Environment Variables** y agrega:

   | Variable | Valor |
   |---|---|
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | El `client_email` del JSON |
   | `GOOGLE_PRIVATE_KEY` | El `private_key` del JSON (copia TODO incluyendo `-----BEGIN...`) |
   | `GOOGLE_SHEET_ID` | El ID de tu Google Sheet (paso 1) |
   | `JWT_SECRET` | Cualquier texto secreto largo, ej: `familia-rivera-arcos-2026` |

4. Haz clic en **Deploy**. En ~2 minutos tendrás tu URL tipo `polla-familia-rivera.vercel.app`.

---

## Paso 5 — Ingresar resultados (admin)

Cuando termine un partido, el **administrador** (tú) abre la Google Sheet y en la hoja `resultados` agrega una fila:

| partido_id | goles_local | goles_visitante | cerrado |
|---|---|---|---|
| G001 | 2 | 1 | TRUE |

Los IDs de partido van de `G001` a `G072`. Puedes ver el listado completo en `lib/partidos-data.ts`.

---

## Sistema de puntos

| Si aciertas… | Puntos |
|---|---|
| El marcador exacto | **5** |
| La diferencia de goles | **3** |
| El ganador o empate | **2** |
| Nada | **0** |

---

## Soporte

Si algo no funciona, revisa:
- Que el `client_email` tenga acceso Editor a la Google Sheet.
- Que el `GOOGLE_PRIVATE_KEY` tenga los `\n` correctamente (en Vercel, pega la clave tal cual, incluyendo saltos de línea).
- Que las hojas se llamen exactamente `jugadores`, `pronosticos`, `resultados`.
