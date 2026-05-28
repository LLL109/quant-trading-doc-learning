"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  type Time,
} from "lightweight-charts";

interface KLineChartProps {
  data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  height?: number;
  mobileHeight?: number;
  showVolume?: boolean;
}

export default function KLineChart({
  data,
  height = 400,
  mobileHeight = 320,
  showVolume = true,
}: KLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const getChartHeight = () =>
      window.matchMedia("(max-width: 640px)").matches ? mobileHeight : height;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: getChartHeight(),
      layout: {
        background: { type: ColorType.Solid, color: "#0a0e17" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      crosshair: {
        vertLine: { color: "#334155", width: 1, style: 2, labelBackgroundColor: "#334155" },
        horzLine: { color: "#334155", width: 1, style: 2, labelBackgroundColor: "#334155" },
      },
      rightPriceScale: { borderColor: "#1e293b" },
      timeScale: { borderColor: "#1e293b", timeVisible: false },
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00d4aa",
      downColor: "#ff6b6b",
      borderUpColor: "#00d4aa",
      borderDownColor: "#ff6b6b",
      wickUpColor: "#00d4aa",
      wickDownColor: "#ff6b6b",
    });
    candleSeries.setData(data.map((d) => ({
      time: d.date as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })));

    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: "#3b82f6",
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      volumeSeries.setData(data.map((d) => ({
        time: d.date as Time,
        value: d.volume,
        color: d.close >= d.open ? "rgba(0,212,170,0.3)" : "rgba(255,107,107,0.3)",
      })));
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: getChartHeight(),
        });
      }
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data, height, mobileHeight, showVolume]);

  return <div ref={chartContainerRef} />;
}
