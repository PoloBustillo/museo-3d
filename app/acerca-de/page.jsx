export default function AcercaDe() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-foreground">Acerca del Mural ARPA</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Una iniciativa cultural que busca preservar y difundir el arte mural mexicano 
            a través de la tecnología y la experiencia digital.
          </p>
        </div>
      </section>

      {/* Historia Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">Nuestra Historia</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  El Mural ARPA nació como parte de un esfuerzo colectivo por documentar
                   y visibilizar las obras murales creadas por estudiantes de la Facultad
                    de Artes de la BUAP, muchas de las cuales han sido desarrolladas en
                   colaboración con eventos culturales y académicos como el Primer Hackatón BUAP. 
                   Este proyecto refleja la fusión entre tradición artística y vanguardia tecnológica,
                   con el objetivo de preservar el legado del muralismo mexicano en la era digital.

                </p>
                <p>
                 Nuestro proyecto combina la tradición del muralismo mexicano con 
                  las tecnologías más avanzadas para crear experiencias inmersivas 
                  que conectan a las personas con el arte.
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
              <img src="/images/El_Performance.JPG" alt="El performance" className="w-full h-full object-cover rounded-lg"/>
            </div>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-lg border shadow-sm">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Nuestra Misión</h3>
              <p className="text-muted-foreground">
                Preservar, documentar y difundir el arte mural mexicano a través de 
                tecnologías digitales innovadoras, haciendo accesible este patrimonio 
                cultural a audiencias globales. Buscamos convertirnos en un puente entre 
                el arte tradicional y las nuevas formas de interacción digital, garantizando 
                que las obras murales realizadas por artistas emergentes tengan vida propia 
                más allá de las paredes donde fueron creadas.
              </p>
            </div>
            <div className="bg-card p-8 rounded-lg border shadow-sm">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Nuestra Visión</h3>
              <p className="text-muted-foreground">
                Ser la plataforma líder mundial en la preservación y experiencia 
                digital del arte mural, conectando artistas, historiadores y 
                amantes del arte en una comunidad global.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Nuestro Equipo</h2>
          <div className="col-span-3 flex justify-center text-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/images/Equipo_6.jpg" alt="Redactor de Contenidos" className="object-cover rounded-lg"/>
              </div>
              <h4 className="font-semibold text-foreground">Director de Arte</h4>
              <p className="text-sm text-muted-foreground">Especialista en muralismo mexicano</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6 text-foreground mt-12">Devs</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/images/Equipo_5.jpg" alt="Redactor de Contenidos" className="object-cover rounded-lg"/>
              </div>
              <h4 className="font-semibold text-foreground">Director de Proyecto</h4>
              <p className="text-sm text-muted-foreground">Polo Bustillo</p>
              <p className="text-sm text-muted-foreground">Experto en tecnologías digitales</p>
div>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/images/Equipo_1.jpg" alt="Redactor de Contenidos" className="object-cover rounded-lg"/>
              </div>
              <h4 className="font-semibold text-foreground">Arquitecto de Bases de Datos</h4>
              <p className="text-sm text-muted-foreground">Dayron Salazar</p>
              <p className="text-sm text-muted-foreground">Especialista en gestión y modelado de datos</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/images/Equipo_2.jpg" alt="Redactor de Contenidos" className="object-cover rounded-lg"/>
              </div>
              <h4 className="font-semibold text-foreground">Arquitecto de Bases de Datos</h4>
              <p className="text-sm text-muted-foreground">Angel Peréz</p>
              <p className="text-sm text-muted-foreground">Especialista en gestión y modelado de datos</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/images/Equipo_3.jpg" alt="Redactor de Contenidos" className="object-cover rounded-lg"/>
              </div>
              <h4 className="font-semibold text-foreground">Diseñador UI</h4>
              <p className="text-sm text-muted-foreground">Ixcheel Huerta</p>
              <p className="text-sm text-muted-foreground">Creador del diseño visual e interfaz digital</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/images/Equipo_2.jpg" alt="Redactor de Contenidos" className="object-cover rounded-lg"/>
              </div>
              <h4 className="font-semibold text-foreground">Diseñador UI</h4>
              <p className="text-sm text-muted-foreground">Andrei Carro</p>
              <p className="text-sm text-muted-foreground">Creador del diseño visual e interfaz digital</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/images/Equipo_4.jpg" alt="Redactor de Contenidos" className="object-cover rounded-lg"/>
              </div>
              <h4 className="font-semibold text-foreground">Diseñador UX</h4>
              <p className="text-sm text-muted-foreground">Kenai Sánchez</p>
              <p className="text-sm text-muted-foreground">Experto en usabilidad y experiencia digital</p>
            </div>

            <div className="col-span-3 flex justify-center text-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/images/Equipo_4.jpg" alt="Redactor de Contenidos" className="object-cover rounded-lg"/>
              </div>
              <h4 className="font-semibold text-foreground">Redactor de Contenidos</h4>
              <p className="text-sm text-muted-foreground">Dante Castelán</p>
              <p className="text-sm text-muted-foreground">Encargado de la narrativa y edición web</p>
            </div>
            </div>
          </div>
        </div>
      </section>


      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Únete a Nuestra Misión</h2>
          <p className="text-xl mb-8 opacity-90">
            Ayúdanos a preservar el patrimonio cultural mexicano para las futuras generaciones.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/museo" 
              className="bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Explorar Museo
            </a>
            <a 
              href="/subir-archivo" 
              className="border border-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-semibold"
            >
              Contribuir
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
