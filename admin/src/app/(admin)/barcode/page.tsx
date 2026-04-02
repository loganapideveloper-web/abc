'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Search, Package, RefreshCw, X, CheckCircle, AlertCircle, Camera, ScanLine, Smartphone, Printer, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, Column } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { barcodeService, BarcodeProduct } from '@/services/barcode.service';
import { productService } from '@/services/product.service';
import { formatCurrency, getInitials } from '@/lib/utils';
import type { Product } from '@/types';

const LIMIT = 15;

type BillingItem = BarcodeProduct & { quantity: number };

export default function BarcodePage() {
  // Lookup state
  const [query, setQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<BarcodeProduct | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [looking, setLooking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanFrameRef = useRef<number | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [detectedCode, setDetectedCode] = useState('');

  // Products table state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);

  const loadProducts = useCallback(async () => {
    setLoadingTable(true);
    try {
      const res = await productService.getAll({ page, limit: LIMIT, search: search || undefined });
      setProducts(res.products);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalProducts);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoadingTable(false);
    }
  }, [page, search]);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { setPage(1); }, [search]);

  const stopCamera = useCallback(() => {
    if (scanFrameRef.current) {
      cancelAnimationFrame(scanFrameRef.current);
      scanFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScannerOpen(false);
  }, []);

  useEffect(() => {
    setCameraSupported(typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia);
    return () => stopCamera();
  }, [stopCamera]);

  const handleLookup = async (rawCode?: string) => {
    const code = (rawCode ?? query).trim();
    if (!code) return;
    setQuery(code);
    setDetectedCode(code);
    setLooking(true);
    setLookupResult(null);
    setLookupError('');
    try {
      const result = await barcodeService.stockCheck(code);
      setLookupResult(result);
      setLookupError('');
      if (rawCode) {
        setBillingItems((prev) => {
          const existing = prev.find((item) => item._id === result._id);
          if (existing) {
            return prev.map((item) =>
              item._id === result._id ? { ...item, quantity: item.quantity + 1 } : item,
            );
          }
          return [...prev, { ...result, quantity: 1 }];
        });
      }
    } catch {
      setLookupError(`No product found for code: ${code}`);
    } finally {
      setLooking(false);
    }
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera scanning is not supported on this device or browser.');
      return;
    }

    try {
      setCameraError('');
      setLookupError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      streamRef.current = stream;
      setScannerOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const BarcodeDetectorClass = (window as any).BarcodeDetector;
      if (!BarcodeDetectorClass) {
        setCameraError('Live preview is open. For automatic camera scanning, use Chrome on Android. USB or Bluetooth barcode scanners also work instantly.');
        return;
      }

      const detector = new BarcodeDetectorClass({
        formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e', 'qr_code'],
      });

      const scan = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const results = await detector.detect(videoRef.current);
          const scanned = results?.[0]?.rawValue?.trim();
          if (scanned) {
            stopCamera();
            await handleLookup(scanned);
            return;
          }
        } catch {
          // ignore frame read errors and continue scanning
        }
        scanFrameRef.current = window.requestAnimationFrame(scan);
      };

      scanFrameRef.current = window.requestAnimationFrame(scan);
    } catch {
      stopCamera();
      setCameraError('Unable to access the camera. Please allow permission and try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLookup();
  };

  const handleRegenerate = async (productId: string) => {
    setRegeneratingId(productId);
    try {
      await barcodeService.regenerate(productId);
      toast.success('Barcode regenerated');
      loadProducts();
    } catch {
      toast.error('Failed to regenerate barcode');
    } finally {
      setRegeneratingId(null);
    }
  };

  const addToBilling = (product: BarcodeProduct) => {
    setBillingItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to billing`);
  };

  const updateBillingQty = (productId: string, delta: number) => {
    setBillingItems((prev) =>
      prev
        .map((item) =>
          item._id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeBillingItem = (productId: string) => {
    setBillingItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const clearBilling = () => {
    setBillingItems([]);
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const printBarcodeLabel = (product: { name: string; sku?: string; barcode?: string; price?: number }) => {
    const printWindow = window.open('', '_blank', 'width=420,height=560');
    if (!printWindow) return;

    const code = escapeHtml(product.barcode || product.sku || 'NO-CODE');
    const name = escapeHtml(product.name || 'Product');
    const sku = escapeHtml(product.sku || '—');
    const price = typeof product.price === 'number' ? formatCurrency(product.price) : '—';

    printWindow.document.write(`
      <html>
        <head>
          <title>Barcode Label</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            .label { width: 320px; border: 1px solid #111; border-radius: 12px; padding: 16px; margin: 0 auto; }
            .title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
            .meta { font-size: 12px; color: #444; margin-bottom: 10px; }
            .barcode { height: 72px; border-radius: 6px; border: 1px solid #222; background: repeating-linear-gradient(to right, #111 0px, #111 2px, transparent 2px, transparent 4px, #111 4px, #111 5px, transparent 5px, transparent 8px); }
            .code { text-align: center; font-family: monospace; letter-spacing: 0.35em; font-size: 14px; margin-top: 8px; }
            .price { margin-top: 12px; font-weight: 700; }
            @media print { body { padding: 0; } .label { border: 1px solid #000; box-shadow: none; } }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="label">
            <div class="title">${name}</div>
            <div class="meta">SKU: ${sku}</div>
            <div class="barcode"></div>
            <div class="code">${code}</div>
            <div class="price">Price: ${price}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printBillingReceipt = () => {
    if (billingItems.length === 0) return;
    const printWindow = window.open('', '_blank', 'width=420,height=700');
    if (!printWindow) return;

    const total = billingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemsHtml = billingItems
      .map(
        (item) => `
          <tr>
            <td style="padding: 6px 0;">${escapeHtml(item.name)}</td>
            <td style="padding: 6px 0; text-align:center;">${item.quantity}</td>
            <td style="padding: 6px 0; text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
          </tr>
        `,
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>POS Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 18px; }
            .receipt { max-width: 360px; margin: 0 auto; }
            h1 { font-size: 18px; margin: 0 0 6px; }
            p { margin: 0 0 4px; font-size: 12px; color: #444; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
            .total { margin-top: 14px; font-size: 16px; font-weight: 700; text-align: right; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="receipt">
            <h1>AMOHA Mobiles</h1>
            <p>Quick POS Receipt</p>
            <p>${new Date().toLocaleString()}</p>
            <table>
              <thead>
                <tr>
                  <th style="text-align:left; border-bottom:1px solid #ddd; padding-bottom:6px;">Item</th>
                  <th style="text-align:center; border-bottom:1px solid #ddd; padding-bottom:6px;">Qty</th>
                  <th style="text-align:right; border-bottom:1px solid #ddd; padding-bottom:6px;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div class="total">Grand Total: ${formatCurrency(total)}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const billingTotal = billingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const billingUnits = billingItems.reduce((sum, item) => sum + item.quantity, 0);

  const renderBarcodeVisual = (code?: string, compact = false) => {
    if (!code) return <span className="text-xs text-muted-foreground">—</span>;

    return (
      <div className={compact ? 'min-w-[112px]' : 'w-full'}>
        <div
          className={`${compact ? 'h-8' : 'h-12'} w-full rounded-md border border-border/70 bg-background`}
          style={{
            backgroundImage:
              'repeating-linear-gradient(to right, #111827 0px, #111827 2px, transparent 2px, transparent 4px, #111827 4px, #111827 5px, transparent 5px, transparent 8px)',
            opacity: 0.9,
          }}
        />
        <p className={`${compact ? 'mt-1 text-[10px]' : 'mt-2 text-xs'} font-mono tracking-[0.28em] text-foreground`}>
          {code}
        </p>
      </div>
    );
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          {p.images?.[0] ? (
            <Image
              src={p.images[0]}
              alt={p.name}
              width={36}
              height={36}
              className="rounded-md object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium text-sm text-foreground line-clamp-1">{p.name}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(p.price)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (p) => (
        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
          {(p as any).sku || '—'}
        </code>
      ),
    },
    {
      key: 'barcode',
      header: 'Barcode',
      render: (p) => renderBarcodeVisual((p as any).barcode, true),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => (
        <Badge variant={p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'destructive'}>
          {p.stock} units
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (p) => (
        <div className="flex items-center gap-2">
          <Link href={`/products/${p._id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
          <Button
            variant="outline"
            size="icon-sm"
            title="Print barcode label"
            onClick={() => printBarcodeLabel({ name: p.name, sku: p.sku, barcode: p.barcode, price: p.price })}
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            title="Regenerate barcode"
            disabled={regeneratingId === p._id}
            onClick={() => handleRegenerate(p._id)}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${regeneratingId === p._id ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Barcode & SKU"
        description="Scan with mobile camera, USB scanner, or manual code entry to find products instantly for real customers"
      />

      {/* Lookup tool */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle>Live Barcode Scanner</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-950 p-3 text-white shadow-sm">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-emerald-400/25 bg-black">
                {scannerOpen ? (
                  <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_55%)] px-4 text-center">
                    <Camera className="mb-3 h-10 w-10 text-emerald-300" />
                    <p className="text-sm font-semibold">Camera scanner ready</p>
                    <p className="mt-1 max-w-xs text-xs text-slate-300">
                      Use your mobile rear camera or a handheld USB / Bluetooth scanner for fast counter billing.
                    </p>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-emerald-400" />
                  <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-emerald-400" />
                  <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-emerald-400" />
                  <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-emerald-300 shadow-[0_0_12px_2px_rgba(52,211,153,0.55)] animate-pulse" />
                  <div
                    className="absolute inset-4 opacity-20"
                    style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(52,211,153,0.95) 0px, rgba(52,211,153,0.95) 2px, transparent 2px, transparent 8px)' }}
                  />
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-300">Detected Code</p>
                <p className="mt-1 font-mono text-sm tracking-[0.3em] text-white/90">
                  {detectedCode || query || 'READY-TO-SCAN'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan a product barcode or SKU to instantly show product name, stock, and price. Best for billing counters, stock rooms, and mobile shop staff.
              </p>

              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Scan barcode or type SKU / barcode number..."
                  className="font-mono"
                  autoFocus
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => handleLookup()} disabled={looking || !query.trim()}>
                    {looking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    <span className="ml-2">Lookup</span>
                  </Button>
                  <Button variant="outline" onClick={scannerOpen ? stopCamera : startCamera} disabled={!cameraSupported && !scannerOpen}>
                    {scannerOpen ? <X className="h-4 w-4" /> : <ScanLine className="h-4 w-4" />}
                    <span className="ml-2">{scannerOpen ? 'Stop Camera' : 'Open Camera Scanner'}</span>
                  </Button>
                  {(lookupResult || lookupError || query) && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setLookupResult(null);
                        setLookupError('');
                        setQuery('');
                        setDetectedCode('');
                        inputRef.current?.focus();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {!cameraSupported && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                  Camera auto-scan depends on browser support. Manual input and USB / Bluetooth scanners still work perfectly.
                </div>
              )}

              {cameraError && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                  {cameraError}
                </div>
              )}

              {lookupError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {lookupError}
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/20 p-3">
                  <Camera className="mb-2 h-4 w-4 text-primary-500" />
                  <p className="text-xs font-semibold">1. Open camera</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Use rear camera on mobile for best scan speed.</p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3">
                  <Smartphone className="mb-2 h-4 w-4 text-primary-500" />
                  <p className="text-xs font-semibold">2. Align the code</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Keep the barcode inside the scan box and steady for a second.</p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3">
                  <CheckCircle className="mb-2 h-4 w-4 text-primary-500" />
                  <p className="text-xs font-semibold">3. Product opens</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Price and stock show instantly for real customer service.</p>
                </div>
              </div>
            </div>
          </div>

          {lookupResult && (
            <div className="mt-5 rounded-xl border border-border bg-background p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {lookupResult.images?.[0] ? (
                  <Image
                    src={lookupResult.images[0]}
                    alt={lookupResult.name}
                    width={88}
                    height={88}
                    className="rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="flex h-[88px] w-[88px] items-center justify-center rounded-lg bg-muted">
                    <Package className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{lookupResult.name}</p>
                      <p className="text-xs text-muted-foreground">Ready for billing / stock check</p>
                    </div>
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="block text-xs text-muted-foreground">SKU</span>
                      <code className="font-mono text-xs">{lookupResult.sku}</code>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">Stock</span>
                      <Badge variant={lookupResult.stock > 10 ? 'success' : lookupResult.stock > 0 ? 'warning' : 'destructive'}>
                        {lookupResult.stock} units
                      </Badge>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">Price</span>
                      <span className="font-semibold">{formatCurrency(lookupResult.price)}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">Barcode Preview</span>
                      {renderBarcodeVisual(lookupResult.barcode)}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => addToBilling(lookupResult)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Billing
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => printBarcodeLabel({
                        name: lookupResult.name,
                        sku: lookupResult.sku,
                        barcode: lookupResult.barcode,
                        price: lookupResult.price,
                      })}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print Label
                    </Button>
                    <Link href={`/products/${lookupResult._id}/edit`}>
                      <Button size="sm" variant="outline">Go to Product</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Quick POS Billing</CardTitle>
              <p className="text-sm text-muted-foreground">Scan items, update quantities, and print a simple customer receipt.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={clearBilling} disabled={billingItems.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Bill
              </Button>
              <Button size="sm" onClick={printBillingReceipt} disabled={billingItems.length === 0}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {billingItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              No billing items yet. Scan a product and use <strong>Add to Billing</strong> to build a live counter bill.
            </div>
          ) : (
            <div className="space-y-3">
              {billingItems.map((item) => (
                <div key={item._id} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {item.images?.[0] ? (
                      <Image src={item.images[0]} alt={item.name} width={52} height={52} className="rounded-md object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Button variant="outline" size="icon-sm" onClick={() => updateBillingQty(item._id, -1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <Button variant="outline" size="icon-sm" onClick={() => updateBillingQty(item._id, 1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => removeBillingItem(item._id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="text-sm font-semibold text-foreground sm:min-w-[110px] sm:text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-muted/30 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{billingItems.length}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Units</span>
                  <span className="font-medium">{billingUnits}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3 text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(billingTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All products with barcodes table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loadingTable}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products, SKU, or barcode..."
        rowKey={(p) => p._id}
      />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={totalItems}
        pageSize={LIMIT}
      />
    </div>
  );
}
