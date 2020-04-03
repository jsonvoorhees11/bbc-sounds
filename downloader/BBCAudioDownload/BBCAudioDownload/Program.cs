using BBCAudioDownload.Constants;
using Microsoft.VisualBasic.CompilerServices;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace BBCAudioDownload
{
    class Program
    {
        static void Main(string[] args)
        {

            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();

            var podcasts = GetPodcastsFromJson(Paths.UrlStoragePath);
            var downloader = new Downloader(podcasts);
            downloader.DownloadPodcastsAsync().GetAwaiter().GetResult();

            stopwatch.Stop();

            Console.BackgroundColor = ConsoleColor.Blue;
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("Total time: " + stopwatch.ElapsedMilliseconds + "ms");
        }

        private static IEnumerable<Podcast> GetPodcastsFromJson(string filePath)
        {
            var result = new List<Podcast>();
            using (var reader = new StreamReader(filePath))
            {
                string json = reader.ReadToEnd();
                result = JsonSerializer.Deserialize<List<Podcast>>(json);
            }
            return result;
        }

    }
}
