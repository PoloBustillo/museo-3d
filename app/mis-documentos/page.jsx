export default function MisDocumentos() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis Documentos</h1>
      
      <div className="mb-6">
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
          Subir Nuevo Documento
        </button>
      </div>
      
      <div className="grid gap-4">
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-2">Documento de ejemplo</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Subido el 14 de junio, 2025
          </p>
          <div className="flex gap-2">
            <button className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded hover:bg-secondary/80">
              Ver
            </button>
            <button className="text-sm text-red-600 hover:text-red-700">
              Eliminar
            </button>
          </div>
        </div>
        
        <div className="bg-muted/50 p-8 rounded-lg border-2 border-dashed text-center">
          <p className="text-muted-foreground">
            No tienes documentos subidos aún.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Sube tu primer documento para comenzar.
          </p>
        </div>
      </div>
    </div>
  );
}
