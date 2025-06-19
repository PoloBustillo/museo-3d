import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const equipo = [
  {
    nombre: "Mario Leopoldo Bustillo Eguiluz",
    rol: "Experto en tecnologías digitales",
    img: "/images/Equipo_5.jpg",
  },
  {
    nombre: "Ángel Hernández Gonzalez",
    rol: "Área de gestión y modelado de base datos",
    img: "/images/Equipo_4.jpg",
  },
  {
    nombre: "Dayron Jesus Salazar Alfaro",
    rol: "Área de gestión y modelado de base de datos",
    img: "/images/Equipo_2.jpg",
  },
  {
    nombre: "Andrei Carro Flores",
    rol: "Front-end / Diseñador UI/UX",
    img: "/images/Equipo_2.jpg",
  },
  {
    nombre: "Angel Kenai Sanchez Rojas",
    rol: "Front-end / Diseñador UI/UX",
    img: "/images/Equipo_4.jpg",
  },
  {
    nombre: "Ixcheel Jasmin Huerta Ramos",
    rol: "Front-end",
    img: "/images/Equipo_3.jpg",
  },
  {
    nombre: "Dante Castelán Carpinteyro",
    rol: "DevOps",
    img: "/images/Equipo_1.jpg",
  },
];

export default function AcercaDe() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-secondary/10 to-muted/30 flex flex-col items-center justify-start pt-8 md:pt-12 pb-8 md:pb-12">
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Fondo glassmorphism */}
        <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-muted/20 blur-2xl opacity-60" />
      </div>
      <main className="z-10 w-full max-w-5xl mx-auto flex flex-col gap-12 px-4 sm:px-8">
        {/* Hero Section */}
        <Card className="w-full bg-card/80 shadow-xl border-0 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              Acerca del Mural ARPA
            </CardTitle>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-normal" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
              Una iniciativa cultural que busca preservar y difundir el arte mural mexicano a través de la tecnología y la experiencia digital.
            </p>
          </CardHeader>
        </Card>

        {/* Historia Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Card className="bg-card/80 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Nuestra Historia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground font-normal" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
              <p>
                El Mural ARPA nació como parte de un esfuerzo colectivo por documentar y visibilizar las obras murales creadas por estudiantes de la Facultad de Artes de la BUAP, muchas de las cuales han sido desarrolladas en colaboración con eventos culturales y académicos como el Primer Hackatón BUAP. Este proyecto refleja la fusión entre tradición artística y vanguardia tecnológica, con el objetivo de preservar el legado del muralismo mexicano en la era digital.
              </p>
              <p>
                Nuestro proyecto combina la tradición del muralismo mexicano con las tecnologías más avanzadas para crear experiencias inmersivas que conectan a las personas con el arte.
              </p>
            </CardContent>
          </Card>
          <div className="flex items-center justify-center">
            <div className="bg-muted rounded-2xl shadow-lg overflow-hidden w-full h-64 flex items-center justify-center">
              <img src="/images/El_Performance.JPG" alt="El performance" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Misión y Visión */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-card/80 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Nuestra Misión
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground font-normal" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
              Preservar, documentar y difundir el arte mural mexicano a través de tecnologías digitales innovadoras, haciendo accesible este patrimonio cultural a audiencias globales. Buscamos convertirnos en un puente entre el arte tradicional y las nuevas formas de interacción digital, garantizando que las obras murales realizadas por artistas emergentes tengan vida propia más allá de las paredes donde fueron creadas.
            </CardContent>
          </Card>
          <Card className="bg-card/80 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Nuestra Visión
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground font-normal" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
              Ser la plataforma líder mundial en la preservación y experiencia digital del arte mural, conectando artistas, historiadores y amantes del arte en una comunidad global comprometida con la memoria cultural y la innovación artística.
            </CardContent>
          </Card>
        </div>

        {/* Apoyo */}
        <Card className="bg-card/80 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              Con apoyo de:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src="/images/Arpa.webp" alt="Escuela de Artes Plásticas y Audiovisuales (BUAP)" className="object-cover" />
                  <AvatarFallback>ARPA</AvatarFallback>
                </Avatar>
                <h4 className="font-semibold text-foreground">Escuela de Artes Plásticas y Audiovisuales (BUAP)</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipo */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-10 mt-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Nuestro Equipo
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {equipo.map((persona, i) => (
              <Card key={i} className="bg-card/80 shadow-lg border-0 flex flex-col items-center py-6">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={persona.img} alt={persona.nombre} className="object-cover" />
                  <AvatarFallback>{persona.nombre.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg font-semibold mb-1 text-center" style={{ fontFamily: 'var(--font-playfair), serif' }}>{persona.rol}</CardTitle>
                <p className="text-sm text-muted-foreground text-center" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>{persona.nombre}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-primary text-primary-foreground shadow-xl border-0 text-center mt-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              Únete a Nuestra Misión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl mb-8 opacity-90" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
              Ayúdanos a preservar el patrimonio cultural mexicano para las futuras generaciones.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild variant="secondary" className="px-6 py-3 rounded-lg font-semibold text-lg">
                <a href="/museo">Explorar Museo</a>
              </Button>
              <Button asChild variant="outline" className="px-6 py-3 rounded-lg font-semibold text-lg border-white">
                <a href="/crear-sala">Contribuir</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
