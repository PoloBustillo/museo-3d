export default function Perfil() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>
      <div className="max-w-2xl">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
          <p className="text-muted-foreground">
            Aquí podrás editar tu información personal y configurar tu cuenta.
          </p>
          
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="Tu nombre"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="tu@email.com"
              />
            </div>
            
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
