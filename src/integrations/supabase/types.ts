export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contenidos: {
        Row: {
          created_at: string
          curso_id: string | null
          id: string
          nombre: string
          storage_path: string | null
          tema_id: string | null
          texto: string | null
          tipo: string
          unidad_id: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          curso_id?: string | null
          id?: string
          nombre: string
          storage_path?: string | null
          tema_id?: string | null
          texto?: string | null
          tipo?: string
          unidad_id?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          curso_id?: string | null
          id?: string
          nombre?: string
          storage_path?: string | null
          tema_id?: string | null
          texto?: string | null
          tipo?: string
          unidad_id?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contenidos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contenidos_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contenidos_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          anio: number | null
          asignatura: string | null
          created_at: string
          descripcion: string | null
          id: string
          nivel: string | null
          nombre: string
        }
        Insert: {
          anio?: number | null
          asignatura?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nivel?: string | null
          nombre: string
        }
        Update: {
          anio?: number | null
          asignatura?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nivel?: string | null
          nombre?: string
        }
        Relationships: []
      }
      evaluaciones: {
        Row: {
          created_at: string
          estudiante: string
          id: string
          observaciones: string | null
          porcentaje: number
          prueba_id: string
          puntaje_maximo: number
          puntaje_obtenido: number
          resultados: Json
        }
        Insert: {
          created_at?: string
          estudiante?: string
          id?: string
          observaciones?: string | null
          porcentaje?: number
          prueba_id: string
          puntaje_maximo?: number
          puntaje_obtenido?: number
          resultados?: Json
        }
        Update: {
          created_at?: string
          estudiante?: string
          id?: string
          observaciones?: string | null
          porcentaje?: number
          prueba_id?: string
          puntaje_maximo?: number
          puntaje_obtenido?: number
          resultados?: Json
        }
        Relationships: [
          {
            foreignKeyName: "evaluaciones_prueba_id_fkey"
            columns: ["prueba_id"]
            isOneToOne: false
            referencedRelation: "pruebas"
            referencedColumns: ["id"]
          },
        ]
      }
      preguntas: {
        Row: {
          alternativas: Json
          created_at: string
          criterios: string | null
          enunciado: string
          id: string
          orden: number
          prueba_id: string
          puntaje: number
          respuesta_correcta: string | null
          respuesta_esperada: string | null
          rubrica: Json
          tipo: string
        }
        Insert: {
          alternativas?: Json
          created_at?: string
          criterios?: string | null
          enunciado?: string
          id?: string
          orden?: number
          prueba_id: string
          puntaje?: number
          respuesta_correcta?: string | null
          respuesta_esperada?: string | null
          rubrica?: Json
          tipo: string
        }
        Update: {
          alternativas?: Json
          created_at?: string
          criterios?: string | null
          enunciado?: string
          id?: string
          orden?: number
          prueba_id?: string
          puntaje?: number
          respuesta_correcta?: string | null
          respuesta_esperada?: string | null
          rubrica?: Json
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "preguntas_prueba_id_fkey"
            columns: ["prueba_id"]
            isOneToOne: false
            referencedRelation: "pruebas"
            referencedColumns: ["id"]
          },
        ]
      }
      pruebas: {
        Row: {
          contenido_ids: Json
          created_at: string
          curso_id: string | null
          establecimiento: string | null
          estado: string
          id: string
          instrucciones: string | null
          nombre: string
          tema_id: string | null
          unidad_id: string | null
        }
        Insert: {
          contenido_ids?: Json
          created_at?: string
          curso_id?: string | null
          establecimiento?: string | null
          estado?: string
          id?: string
          instrucciones?: string | null
          nombre: string
          tema_id?: string | null
          unidad_id?: string | null
        }
        Update: {
          contenido_ids?: Json
          created_at?: string
          curso_id?: string | null
          establecimiento?: string | null
          estado?: string
          id?: string
          instrucciones?: string | null
          nombre?: string
          tema_id?: string | null
          unidad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pruebas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pruebas_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pruebas_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      temas: {
        Row: {
          created_at: string
          id: string
          nombre: string
          orden: number
          unidad_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          orden?: number
          unidad_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          orden?: number
          unidad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "temas_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades: {
        Row: {
          created_at: string
          curso_id: string
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          created_at?: string
          curso_id: string
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          created_at?: string
          curso_id?: string
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "unidades_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
