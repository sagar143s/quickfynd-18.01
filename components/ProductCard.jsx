"use client";
import { useAuth } from "@/lib/useAuth";
import { ShoppingCartIcon, StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { uploadCart } from '@/lib/features/cart/cartSlice'

import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const dispatch = useDispatch()
    const { getToken } = useAuth()
    const cartItems = useSelector(state => state.cart.cartItems)
    const itemQuantity = cartItems[product._id] || 0

    // Review state and fetching logic
    const [reviews, setReviews] = React.useState([]);
    const [loadingReviews, setLoadingReviews] = React.useState(false);

    React.useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoadingReviews(true);
                const { data } = await import('axios').then(ax => ax.default.get(`/api/review?productId=${product._id}`));
                setReviews(data.reviews || []);
            } catch (error) {
                // silent fail
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchReviews();
    }, [product._id]);

    // Calculate rating and count from fetched reviews, fallback to product fields
    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviews.length
        : (typeof product.averageRating === 'number' ? product.averageRating : 0);
    const ratingCount = reviews.length > 0
        ? reviews.length
        : (typeof product.ratingCount === 'number' ? product.ratingCount : 0);

    // Calculate discount percentage
    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(addToCart({ productId: product._id }))
        dispatch(uploadCart({ getToken }))
        toast.success('Added to cart')
    }

    // Limit product name to 50 characters
    const displayName = product.name.length > 50 ? product.name.slice(0, 50) + '…' : product.name;

    const showPrice = Number(product.price) > 0 || Number(product.mrp) > 0;
    return (
        <Link href={`/product/${product.slug}`} className='group w-full'>
            <div className='bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full relative'>
                {/* Product Image */}
                    <div
                      className={`relative w-full bg-gray-50 overflow-hidden ${getAspectRatioClass(product.aspectRatio)}`}
                    >
                    {discount > 0 && (
                        <span className='absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm z-10'>
                            {discount}% OFF
                        </span>
                    )}
                    {product.fastDelivery && (
                        <span className='absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm z-10'>
                            Fast
                        </span>
                    )}
                    <Image
                        src={
                            product.images && Array.isArray(product.images) && product.images[0] && typeof product.images[0] === 'string' && product.images[0].trim() !== ''
                                ? product.images[0]
                                : 'https://ik.imagekit.io/jrstupuke/placeholder.png'
                        }
                        alt={product.name}
                        fill
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                        onError={(e) => {
                            if (e.currentTarget.src !== 'https://ik.imagekit.io/jrstupuke/placeholder.png') {
                                e.currentTarget.src = 'https://ik.imagekit.io/jrstupuke/placeholder.png';
                            }
                        }}
                    />
                </div>

                {/* Product Details */}
                <div className='flex flex-col p-2 sm:p-2.5'>
                    {/* Product Name */}
                    <h3 className='font-semibold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-1 mb-0.5'>
                        {product.name}
                    </h3>
                    
                    {/* Ratings and Cart Button Row */}
                    <div className='flex items-center justify-between mb-0.5'>
                        <div className='flex items-center gap-0.5'>
                            {ratingCount > 0 ? (
                                <>
                                    <div className='flex items-center'>
                                        {Array(5).fill('').map((_, index) => (
                                            <StarIcon
                                                key={index}
                                                size={10}
                                                className='text-yellow-400'
                                                fill={averageRating >= index + 1 ? "#FBBF24" : "none"}
                                                stroke={averageRating >= index + 1 ? "#FBBF24" : "#D1D5DB"}
                                                strokeWidth={1.5}
                                            />
                                        ))}
                                    </div>
                                    <span className='text-[10px] sm:text-[11px] text-gray-400'>({ratingCount})</span>
                                </>
                            ) : (
                                <span className='text-[10px] sm:text-[11px] text-red-400'>No reviews</span>
                            )}
                        </div>
                        
                        {/* Cart Button */}
                        <button 
                            onClick={handleAddToCart}
                            className='w-8 h-8 sm:w-9 sm:h-9 bg-slate-700 hover:bg-slate-800 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 relative flex-shrink-0'
                        >
                            <ShoppingCartIcon className='text-white' size={15} strokeWidth={2} />
                            {itemQuantity > 0 && (
                                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold min-w-[15px] h-[15px] sm:min-w-[16px] sm:h-[16px] rounded-full flex items-center justify-center shadow-md border-2 border-white px-0.5'>
                                    {itemQuantity > 99 ? '99+' : itemQuantity}
                                </span>
                            )}
                        </button>
                    </div>
                    
                    {/* Price */}
                    {showPrice && (
                        <div className='flex items-center gap-1.5'>
                            {Number(product.price) > 0 && (
                                <p className='text-sm sm:text-base font-bold text-gray-900'>{currency} {product.price}</p>
                            )}
                            {Number(product.mrp) > 0 && Number(product.mrp) > Number(product.price) && Number(product.price) > 0 && (
                                <p className='text-[10px] sm:text-xs text-gray-400 line-through'>{currency} {product.mrp}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

    // Helper function for aspect ratio CSS class
    function getAspectRatioClass(ratio) {
      switch (ratio) {
        case '1:1': return 'aspect-square';
        case '4:6': return 'aspect-[2/3]';
        case '2:3': return 'aspect-[2/3]';
        case '3:4': return 'aspect-[3/4]';
        case '16:9': return 'aspect-[16/9]';
        case '9:16': return 'aspect-[9/16]';
        case '4:5': return 'aspect-[4/5]';
        case '5:7': return 'aspect-[5/7]';
        case '7:10': return 'aspect-[7/10]';
        case '5:8': return 'aspect-[5/8]';
        case '3:2': return 'aspect-[3/2]';
        case '8:10': return 'aspect-[8/10]';
        case '11:14': return 'aspect-[11/14]';
        default: return 'aspect-square';
      }
    }
export default ProductCard

