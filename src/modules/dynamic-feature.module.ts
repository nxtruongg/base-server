import { DynamicModule, Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { RouterModule } from '@nestjs/core';

@Global()
@Module({})
export class DynamicLoaderModule {
  static async register(): Promise<DynamicModule> {
    const baseModulesPath = join(__dirname);
    const schemaRootPath = join(baseModulesPath, '../database/schemas');
    const targetDirectories = [
      'lists',
      'vouchers',
      'reports',
      'systems',
      'public',
    ];

    const controllers = [];
    const providers = [];
    const mongooseSchemas = [];
    const routes = [];

    for (const dir of targetDirectories) {
      const modulesPath = join(baseModulesPath, dir);

      if (!existsSync(modulesPath) || !statSync(modulesPath).isDirectory()) {
        continue;
      }

      const moduleDirectories = readdirSync(modulesPath, {
        withFileTypes: true,
      }).filter((dirent) => dirent.isDirectory());

      for (const subDir of moduleDirectories) {
        const modulePath = join(modulesPath, subDir.name);

        try {
          const controllerPath = `${modulePath}/${subDir.name}.controller`;
          const servicePath = `${modulePath}/${subDir.name}.service`;
          const schemaPath = `${schemaRootPath}/${subDir.name}.schema`;

          if (
            existsSync(`${controllerPath}.js`) ||
            existsSync(`${controllerPath}.ts`)
          ) {
            const controllerModule = await import(controllerPath);
            const controllerClass =
              controllerModule[`${capitalize(subDir.name)}Controller`];
            if (controllerClass) {
              controllers.push(controllerClass);

              routes.push({
                path: dir === 'public' ? '/public' : '/api',
                module: DynamicLoaderModule,
                controllers: [controllerClass],
              });
            }
          }

          if (
            existsSync(`${servicePath}.js`) ||
            existsSync(`${servicePath}.ts`)
          ) {
            const serviceModule = await import(servicePath);
            const serviceClass =
              serviceModule[`${capitalize(subDir.name)}Service`];
            if (serviceClass) {
              providers.push(serviceClass);
            }
          }

          if (
            existsSync(`${schemaPath}.js`) ||
            existsSync(`${schemaPath}.ts`)
          ) {
            const schemaModule = await import(schemaPath);
            const schemaName = capitalize(subDir.name);
            const schema = schemaModule[`${schemaName}Schema`];
            if (schema) {
              mongooseSchemas.push({ name: schemaName, schema });
            }
          }
        } catch (error) {
          console.error(
            `Failed to load module ${subDir.name} in ${dir}:`,
            error,
          );
        }
      }
    }

    return {
      module: DynamicLoaderModule,
      imports: [
        MongooseModule.forFeature(mongooseSchemas),
        RouterModule.register(routes),
      ],
      controllers,
      providers,
      exports: providers.concat(MongooseModule),
    };
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
