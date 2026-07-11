import app from './app';

function printRoutes(app: any) {
  const routes: string[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // routes registered directly on the app
      routes.push(middleware.route.path);
    } else if (middleware.name === 'router') {
      // router middleware
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          routes.push(middleware.regexp.toString() + ' -> ' + handler.route.path);
        } else if (handler.name === 'router') {
          handler.handle.stack.forEach((h: any) => {
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
