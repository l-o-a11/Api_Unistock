import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 1,
    iterations: 1,
};

const BASE_URL = 'http://localhost:3000/api';

export default function () {

    const routes = [
        '/auth/login',   // login (POST no probado aquí, solo GET para ver si existe)
        '/users',
        '/suppliers',
        '/proveedores',
        '/terceros',
        '/produccion',
        '/compras',
        '/insumos',
        '/roles',
        '/sites',
        '/modules',
        '/privileges',
        '/products',
        '/product-categories'
    ];

    routes.forEach(route => {
        const res = http.get(`${BASE_URL}${route}`);

        const ok = check(res, {
            [`${route} status < 500`]: (r) => r.status < 500,
        });

        console.log(`👉 ${route} => ${res.status}`);
    });

}