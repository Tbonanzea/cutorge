'use client';

import { useQuoting } from '@/context/quotingContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Tipos mock para demo (en tu app traé de la API)
interface MaterialOption {
  id: string;
  name: string;
  description?: string;
  types: MaterialTypeOption[];
}
interface MaterialTypeOption {
  id: string;
  name: string;
  width: number;
  length: number;
  height: number;
  pricePerUnit: number;
  stock: number;
}

const MOCK_MATERIALS: MaterialOption[] = [
  {
    id: 'mat1',
    name: 'Acero',
    types: [
      {
        id: 'mat1-type1',
        name: '1mm',
        width: 1000,
        length: 2000,
        height: 1,
        pricePerUnit: 500,
        stock: 20,
      },
      {
        id: 'mat1-type2',
        name: '2mm',
        width: 1000,
        length: 2000,
        height: 2,
        pricePerUnit: 900,
        stock: 10,
      },
    ],
  },
  {
    id: 'mat2',
    name: 'Aluminio',
    types: [
      {
        id: 'mat2-type1',
        name: '0.8mm',
        width: 1000,
        length: 2000,
        height: 0.8,
        pricePerUnit: 800,
        stock: 15,
      },
    ],
  },
];

export default function MaterialSelectionPage() {
  const { cart, updateItem } = useQuoting();
  const [materials, setMaterials] = useState<MaterialOption[]>([]);

  // Simula fetch de materiales (reemplazá por tu fetch real)
  useEffect(() => {
    setTimeout(() => setMaterials(MOCK_MATERIALS), 200);
  }, []);

  // Handler para cambiar material
  const handleMaterialChange = (cartIdx: number, materialId: string) => {
    const mat = materials.find((m) => m.id === materialId);
    updateItem(cartIdx, {
      material: mat
        ? {
            id: mat.id,
            name: mat.name,
            description: mat.description || '',
          }
        : null,
      materialType: null,
    });
  };

  // Handler para cambiar tipo
  const handleMaterialTypeChange = (cartIdx: number, materialId: string, typeId: string) => {
    const mat = materials.find((m) => m.id === materialId);
    const type = mat?.types.find((t) => t.id === typeId);
    updateItem(cartIdx, {
      materialType: type
        ? {
            id: type.id,
            width: type.width,
            length: type.length,
            height: type.height,
            pricePerUnit: type.pricePerUnit,
            massPerUnit: 0, // Simulado
            stock: type.stock,
            errorMargin: 0,
            maxCutLength: 0,
            minCutLength: 0,
            maxCutWidth: 0,
            minCutWidth: 0,
          }
        : null,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seleccioná material para cada archivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {cart.items.length === 0 && (
            <div className="text-gray-500">
              No hay archivos cargados. Volvé al paso anterior.
            </div>
          )}
          {cart.items.map((item, idx) => (
            <div key={item.file.id} className="space-y-2 border-b pb-4 last:border-none last:pb-0">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="min-w-[180px] font-medium">{item.file.filename}</div>
                {/* Material selector */}
                <select
                  className="border rounded px-3 py-2"
                  value={item.material?.id || ''}
                  onChange={(e) => handleMaterialChange(idx, e.target.value)}
                >
                  <option value="">Seleccionar material</option>
                  {materials.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name}
                    </option>
                  ))}
                </select>
                {/* Tipo de material selector */}
                <select
                  className="border rounded px-3 py-2"
                  value={item.materialType?.id || ''}
                  onChange={(e) =>
                    handleMaterialTypeChange(idx, item.material?.id || '', e.target.value)
                  }
                  disabled={!item.material}
                >
                  <option value="">Seleccionar tipo</option>
                  {materials
                    .find((mat) => mat.id === item.material?.id)
                    ?.types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.height}mm)
                      </option>
                    ))}
                </select>
                {/* Quantity input */}
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(idx, { quantity: Number(e.target.value) || 1 })
                  }
                  className="border rounded px-3 py-2 w-24"
                  placeholder="Cantidad"
                />
              </div>
              {/* Podés mostrar errores o alertas aquí si querés */}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
