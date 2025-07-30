import { useState } from "react";
import { Search, X, Filter, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const searchSuggestions = [
  { title: "Ambiente de Control", type: "Flujo de Trabajo", trending: true },
  { title: "Evaluación de Riesgos", type: "Flujo de Trabajo", trending: false },
  { title: "Ley de Creación", type: "Documento", trending: false },
  { title: "Manual de Funciones", type: "Documento", trending: true },
  { title: "Informe de Cumplimiento", type: "Reporte", trending: false },
];

const recentSearches = [
  "Ambiente de Control",
  "Documentos institucionales",
  "Alertas pendientes",
  "Informe de Auditoría"
];

export default function MobileSearch() {
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handleSearch = (query: string) => {
    setSearchValue(query);
    console.log("Searching for:", query);
    // Implement search logic here
  };

  const filteredSuggestions = searchSuggestions.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchValue.toLowerCase());
    const matchesFilter = selectedFilter === "all" || 
                         item.type.toLowerCase().includes(selectedFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="h-full">
        <SheetHeader>
          <SheetTitle>Buscar en Nebusis® ControlCore</SheetTitle>
          <SheetDescription>
            Encuentra flujos de trabajo, documentos e informes rápidamente
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar flujos, documentos, informes..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-4 py-3 text-base"
              autoFocus
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchValue("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo</SelectItem>
                <SelectItem value="flujo">Flujos de Trabajo</SelectItem>
                <SelectItem value="documento">Documentos</SelectItem>
                <SelectItem value="reporte">Reportes</SelectItem>
                <SelectItem value="alerta">Alertas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recent Searches */}
          {!searchValue && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Búsquedas Recientes</h3>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleSearch(search)}
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{search}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results/Suggestions */}
          {(searchValue || selectedFilter !== "all") && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">
                {searchValue ? "Resultados de Búsqueda" : "Sugerencias"}
              </h3>
              <div className="space-y-2">
                {filteredSuggestions.map((item, index) => (
                  <Card key={index} className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">{item.title}</h4>
                            {item.trending && (
                              <Badge variant="secondary" className="text-xs">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{item.type}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSearch(item.title)}
                        >
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredSuggestions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No se encontraron resultados</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-auto p-3">
                <div className="text-center">
                  <div className="text-lg mb-1">📋</div>
                  <div className="text-xs">Nuevo Flujo</div>
                </div>
              </Button>
              <Button variant="outline" size="sm" className="h-auto p-3">
                <div className="text-center">
                  <div className="text-lg mb-1">📄</div>
                  <div className="text-xs">Subir Documento</div>
                </div>
              </Button>
              <Button variant="outline" size="sm" className="h-auto p-3">
                <div className="text-center">
                  <div className="text-lg mb-1">📊</div>
                  <div className="text-xs">Ver Informes</div>
                </div>
              </Button>
              <Button variant="outline" size="sm" className="h-auto p-3">
                <div className="text-center">
                  <div className="text-lg mb-1">🔔</div>
                  <div className="text-xs">Alertas</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}