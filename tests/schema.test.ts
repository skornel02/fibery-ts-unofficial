import { describe, it, expect } from 'vitest';
import { getFibery } from './utils.js';

describe('Fibery Schema Service', () => {
    it('should fetch the schema', async () => {
        const fibery = getFibery();
        const schema = await fibery.getSchema();
        
        expect(schema).toBeDefined();
        expect(Array.isArray(schema)).toBe(true);
        // Basic check that it contains schema info
        expect(schema.length).toBeGreaterThan(0);
        // Let's check for a common type or property that all schemas have
        const userType = schema.find((t: any) => t['fibery/name'] === 'fibery/user');
        expect(userType).toBeDefined();

        // console.log('Schema fetched successfully:', schema);
    });
});
