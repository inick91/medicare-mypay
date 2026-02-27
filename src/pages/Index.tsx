useEffect(() => {
  const fetch = async () => {
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("Auth error:", authError);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setCommissions([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("commissions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch commissions error:", error);
      setLoading(false);
      return;
    }

    if (data) setCommissions(data.map(mapRow));
    setLoading(false);
  };

  fetch();
}, []);
