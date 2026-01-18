import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import authSeller from '@/middlewares/authSeller'
import Store from '@/models/Store'

export async function GET(request) {
    try {
        await connectDB()

        // Firebase Auth
        const authHeader = request.headers.get('authorization')
        let userId = null
        if (authHeader?.startsWith('Bearer ')) {
            const idToken = authHeader.split('Bearer ')[1]
            const { getAuth } = await import('firebase-admin/auth')
            const { initializeApp, getApps } = await import('firebase-admin/app')
            if (getApps().length === 0) {
                initializeApp({ credential: await import('firebase-admin/app').then(m => m.applicationDefault()) })
            }
            try {
                const decodedToken = await getAuth().verifyIdToken(idToken)
                userId = decodedToken.uid
            } catch (e) {
                // Not authenticated
            }
        }

        const storeId = await authSeller(userId)
        if (!storeId) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

        const store = await Store.findById(storeId).select('featuredProductIds')
        
        return NextResponse.json({ 
            productIds: store?.featuredProductIds || []
        })
    } catch (error) {
        console.error('Error fetching featured products:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

export async function POST(request) {
    try {
        await connectDB()

        // Firebase Auth
        const authHeader = request.headers.get('authorization')
        let userId = null
        if (authHeader?.startsWith('Bearer ')) {
            const idToken = authHeader.split('Bearer ')[1]
            const { getAuth } = await import('firebase-admin/auth')
            const { initializeApp, getApps } = await import('firebase-admin/app')
            if (getApps().length === 0) {
                initializeApp({ credential: await import('firebase-admin/app').then(m => m.applicationDefault()) })
            }
            try {
                const decodedToken = await getAuth().verifyIdToken(idToken)
                userId = decodedToken.uid
            } catch (e) {
                // Not authenticated
            }
        }

        const storeId = await authSeller(userId)
        if (!storeId) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

        const { productIds } = await request.json()

        // Validate productIds is an array
        if (!Array.isArray(productIds)) {
            return NextResponse.json({ error: 'productIds must be an array' }, { status: 400 })
        }

        // Update store with featured product IDs
        const store = await Store.findByIdAndUpdate(
            storeId,
            { featuredProductIds: productIds },
            { new: true }
        )

        return NextResponse.json({ 
            message: 'Featured products updated successfully',
            productIds: store.featuredProductIds 
        })
    } catch (error) {
        console.error('Error saving featured products:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
