CREATE POLICY "contenidos lectura" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'contenidos');
CREATE POLICY "contenidos carga" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'contenidos');
CREATE POLICY "contenidos update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'contenidos') WITH CHECK (bucket_id = 'contenidos');
CREATE POLICY "contenidos borrado" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'contenidos');