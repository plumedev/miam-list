<template>
  <div class="min-h-screen flex flex-col bg-[#F9F9F9] dark:bg-gray-950 font-sans">
    
    <!-- Top Header (App style) -->
    <header class="bg-white dark:bg-gray-900 sticky top-0 z-50 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
      <div class="max-w-md mx-auto flex justify-between items-center">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center shadow-sm">
            <UIcon name="i-heroicons-shopping-bag" class="w-6 h-6" />
          </div>
          <div class="text-sm">
            <p class="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1">
              <UIcon name="i-heroicons-map-pin" class="w-3 h-3" />
              Ma cuisine
            </p>
            <p class="font-bold text-gray-900 dark:text-white">Scanner & Courses</p>
          </div>
        </NuxtLink>
        <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
          <img src="https://ui-avatars.com/api/?name=L+U&background=random&color=fff" alt="Avatar" />
        </div>
      </div>
    </header>
    
    <!-- Main Content constrained to mobile width -->
    <main class="flex-grow max-w-md w-full mx-auto p-4 relative">
      <slot />
    </main>

    <!-- Bottom Navigation Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-safe z-50">
      <div class="max-w-md mx-auto flex justify-around p-3">
        <NuxtLink 
          to="/" 
          class="flex flex-col items-center gap-1 w-16 text-gray-400 transition-colors" 
          active-class="text-primary-500"
        >
          <UIcon name="i-heroicons-camera" class="w-6 h-6" />
          <span class="text-[10px] font-semibold tracking-wide">Scanner</span>
        </NuxtLink>
        <NuxtLink 
          to="/recipes" 
          class="flex flex-col items-center gap-1 w-16 text-gray-400 transition-colors" 
          active-class="text-primary-500"
        >
          <UIcon name="i-heroicons-book-open" class="w-6 h-6" />
          <span class="text-[10px] font-semibold tracking-wide">Recettes</span>
        </NuxtLink>
        <NuxtLink 
          to="/shopping-list" 
          class="flex flex-col items-center gap-1 w-16 text-gray-400 transition-colors" 
          active-class="text-primary-500"
        >
          <UIcon name="i-heroicons-shopping-cart" class="w-6 h-6" />
          <span class="text-[10px] font-semibold tracking-wide">Ma Liste</span>
        </NuxtLink>
      </div>
    </div>

  </div>
</template>
