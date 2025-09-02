// src/utils/useFetch.js
import { useEffect, useState } from "react";


export default function useFetch(asyncFn, deps = []) {
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);


useEffect(() => {
let alive = true;
setLoading(true);
setError(null);


asyncFn()
.then((d) => { if (alive) setData(d); })
.catch((e) => { if (alive) setError(e); })
.finally(() => { if (alive) setLoading(false); });


return () => { alive = false; };
}, deps); // eslint-disable-line react-hooks/exhaustive-deps


return { data, loading, error };
}