'use client'

import ProductCard from "@/components/ProductCard";
import { StarIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/features/product/productSlice";

export default function FiveStarRated() {
    const dispatch = useDispatch();
    const [ratedProducts, setRatedProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Ensure products are loaded
    // Prime cache with products (optional, non-blocking)
    useEffect(() => {
        dispatch(fetchProducts({ limit: 24 }));
    }, [dispatch]);

    // Compute average rating >= 4 by fetching approved reviews per product
    useEffect(() => {
        const fetchTopRated = async () => {
            setLoading(true);
            try {
                const axios = (await import('axios')).default;
                const { data } = await axios.get('/api/products/top-rated?threshold=4&limit=50');
                setRatedProducts(data.products || []);
            } catch (e) {
                console.error('Failed to load top-rated products', e);
                setRatedProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTopRated();
    }, []);

    return (
        <div className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    size={32}
                                    fill="#FFA500"
                                    className="text-orange-500"
                                />
                            ))}
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        4+ Star Rated Products
                    </h1>
                    <p className="text-gray-600">
                        Showing products rated 4 stars and above ({ratedProducts.length} found)
                    </p>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center py-16 text-gray-500">Loading top-rated products…</div>
                ) : ratedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {ratedProducts.map((product, idx) => (
                            <ProductCard key={product._id || product.id || idx} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <StarIcon size={48} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            No products rated 4+ yet
                        </h2>
                        <p className="text-gray-500">
                            Check back soon for highly-rated products!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
