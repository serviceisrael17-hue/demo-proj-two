import { useState, useEffect } from 'react';
import { supabase } from '../db/supabaseClient';

export function useSupabaseCollection(table) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      const { data: result, error } = await supabase.from(table).select('*').order('id', { ascending: true });
      if (error) {
        console.error('Error fetching ' + table, error);
      } else if (isMounted) {
        setData(result || []);
      }
      if (isMounted) setLoading(false);
    };

    fetchData();

    const channel = supabase.channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setData(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [table]);

  return data;
}
