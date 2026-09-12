# Administración de Santafe Playa

La página pública sigue mostrando sus enlaces, galería y preguntas frecuentes. Con el servidor Node activo, `admin.html` permite publicar fotos, noticias y eventos desde la propia web. Las fotos y publicaciones se guardan en el directorio indicado por `DATA_DIR` y las ve todo el mundo. Solo una persona con la contraseña puede crear o borrar contenido.

## Puesta en marcha

1. Necesitas un alojamiento que ejecute Node.js 20 o posterior y un volumen persistente para las fotos. **GitHub Pages no ejecuta el servidor**, así que allí seguirán funcionando la web estática y la subida de fotos mediante GitHub, pero el panel no podrá iniciar sesión ni guardar contenido.
2. Configura `ADMIN_PASSWORD` con una contraseña larga y única. Configura `DATA_DIR` con la ruta del volumen persistente (por ejemplo `/var/lib/santafe`). No guardes la contraseña en GitHub.
3. Arranca con `npm start`. El servidor escucha en `PORT` (por defecto 3000); publica el sitio detrás de HTTPS y configura `NODE_ENV=production` para que la cookie de sesión solo viaje por HTTPS.
4. Visita `https://tu-dominio/admin.html`, entra y publica. Copia periódicamente `DATA_DIR` para tener una copia de seguridad.

No hay cuenta de administrador predefinida. Si el servidor se reinicia, tendrás que iniciar sesión de nuevo; las fotos y publicaciones seguirán en el volumen. Las imágenes admitidas son JPG, PNG y WebP de hasta 5 MB. Para probar localmente: `ADMIN_PASSWORD='una-clave-larga-y-unica' npm start`, luego abre `http://localhost:3000`. Ejecuta `npm test` para probar autenticación, publicación y eliminación.

La carpeta `assets/gallery` sigue siendo una alternativa para fotos subidas con GitHub. Si el servidor dinámico no está disponible, la web muestra esa galería estática. Para usar el panel en producción hay que trasladar el dominio al alojamiento Node y conservar el volumen de datos; subir estos archivos al repositorio por sí solo no activa el servidor.
