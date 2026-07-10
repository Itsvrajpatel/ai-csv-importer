import app from './src/app';

function printRoutes(app: any) {
  const routes: string[] = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // routes registered directly on the app
      routes.push(middleware.route.path);
    } else if (middleware.name === 'router') {
      // router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push(middleware.regexp.toString() + ' -> ' + handler.route.path);
        } else if (handler.name === 'router') {
           handler.handle.stack.forEach(h => {
             if (h.route) {
               routes.push(middleware.regexp.toString() + ' -> ' + handler.regexp.toString() + ' -> ' + h.route.path);
             }
           });
        }
      });
    }
  });
  console.log('Registered Routes:', routes);
}

printRoutes(app);
