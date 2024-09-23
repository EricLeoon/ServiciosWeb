# ServiciosWeb
## Autores
- [Curiel Perea Loibeth - 20161179](https://github.com/usuario)
- [León Cruz Eric Moisés - 20161238](https://github.com/usuario)
- [Juarez Velasco Rodrigo - 20161224](https://github.com/usuario)

## Como Contribuir
1. Clonar el Proyecto
Clona el proyecto desde un repositorio remoto para obtener una copia local.
git clone https://github.com/EricLeoon/ServiciosWeb.git
Esto descarga el repositorio remoto en una carpeta local.
2. Navegar al Directorio del Proyecto
Ve a la carpeta del proyecto recién clonado.
cd repositorio
3. Crear y Cambiar a una Nueva Rama (opcional)
Para trabajar en una nueva característica o corrección de errores, crea una nueva rama.
git checkout -b nombre-de-la-rama
4. Hacer Cambios en los Archivos
Realiza las modificaciones que necesites en los archivos del proyecto utilizando tu editor de código.

5. Añadir los Cambios al Área de Preparación
Después de hacer cambios, debes añadirlos al área de preparación.
git add archivo1.txt archivo2.txt
O para añadir todos los archivos modificados:
git add .
6. Hacer un Commit con los Cambios
Guarda tus cambios en el historial de Git con un mensaje descriptivo.
git commit -m "Descripción clara del cambio realizado"
7. Verificar el Estado del Repositorio
Es útil verificar el estado del repositorio antes de enviar los cambios.
git status
8. Enviar los Cambios al Repositorio Remoto
Envía los cambios de tu rama al repositorio remoto.
git push origin nombre-de-la-rama
Si estás trabajando en la rama principal (main o master), reemplaza nombre-de-la-rama con main o master según sea el caso.
9. Actualizar el Repositorio Local con Cambios del Remoto
Para traer cambios recientes del remoto y fusionarlos con tu rama local:
git pull origin nombre-de-la-rama
10. Revisar el Historial de Cambios
Puedes ver el historial de commits en el repositorio para verificar los cambios realizados.
git log
Flujo Completo de Ejemplo
## Resumen
1. Clonar el repositorio:
git clone https://github.com/EricLeoon/ServiciosWeb.git
2. Navegar al directorio:
cd proyecto
3. Crear y cambiar a una nueva rama (opcional):
git checkout -b nueva-funcionalidad
4. Realizar cambios en los archivos: Modifica los archivos con tu editor.
5. Agregar los cambios:
git add .
6. Hacer un commit:
git commit -m "Agrega nueva funcionalidad"
7. Enviar los cambios al repositorio remoto:
git push origin nueva-funcionalidad
