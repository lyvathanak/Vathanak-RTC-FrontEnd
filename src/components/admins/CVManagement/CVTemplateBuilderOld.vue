<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900">{{ getModalTitle() }}</h2>
        <button 
          @click="closeModal"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- TEMPLATE LIST VIEW -->
        <div v-if="currentView === 'list'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Existing Templates</h3>
            <button 
              @click="createNewTemplate"
              class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus class="w-4 h-4" />
              New Template
            </button>
          </div>

          <!-- DEBUG: Show templates count -->
          <div v-if="debugMode" class="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
            Templates in array: {{ templates.length }}
            <div v-for="(template, idx) in templates" :key="idx" class="mt-1">
              Template {{ idx }}: "{{ template.name || 'No name' }}" (ID: {{ template.id || 'No ID' }}) - Sections: {{ template.sections?.length || 0 }}
            </div>
          </div>

          <!-- In the template list section of CVTemplateBuilder.vue -->
          <div v-if="templates.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="template in templates" 
              :key="template.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h4 class="font-semibold text-gray-900 mb-2">{{ template.name }}</h4>
              <p class="text-gray-600 text-sm mb-3">{{ template.description }}</p>
              
              <div class="mb-3">
                <h5 class="text-sm font-medium text-gray-700 mb-2">Sections:</h5>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="(section, index) in template.sections" 
                    :key="index" 
                    class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                  >
                    {{ section.name }}
                  </span>
                </div>
              </div>

              <div class="flex gap-2">
                <button 
                  @click="editTemplate(template)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button 
                  @click="previewTemplate(template)"
                  class="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Preview
                </button>
                <button 
                  @click="assignTemplate(template)"
                  class="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  Assign
                </button>
                <!-- ADD DELETE BUTTON -->
                <button 
                  @click="deleteTemplate(template)"
                  class="text-red-600 hover:text-red-800 text-sm font-medium ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div 
            v-if="templates.length === 0"
            class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
          >
            <FileText class="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 class="text-lg font-medium text-gray-900 mb-2">No Templates Yet</h4>
            <p class="text-gray-500 mb-4">Create your first CV template to get started</p>
            <button 
              @click="createNewTemplate"
              class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus class="w-4 h-4" />
              Create First Template
            </button>
          </div>
        </div>

        <!-- EDIT/CREATE TEMPLATE VIEW -->
        <div v-else-if="currentView === 'edit'" class="space-y-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-xl font-bold text-blue-900 mb-2">
              {{ editingTemplate.id ? 'Edit Template' : 'Create New Template' }}
            </h3>
            <p class="text-blue-700 text-sm">
              {{ editingTemplate.id ? 'Update your existing template' : 'Define the sections and fields for your new CV template' }}
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <input 
                v-model="editingTemplate.name"
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter template name (e.g., Professional CV Template)"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea 
                v-model="editingTemplate.description"
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what this template is for (e.g., Standard professional CV with photo and sections)"
              />
            </div>

            <!-- Template Sections -->
            <div class="border border-gray-200 rounded-lg">
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">
                      Template Sections *
                    </label>
                    <p class="text-xs text-gray-500 mt-1">Organize fields into sections</p>
                  </div>
                  <button 
                    @click="addSection"
                    type="button"
                    class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium bg-white px-3 py-1 rounded border border-blue-200"
                  >
                    <Plus class="w-4 h-4" />
                    Add Section
                  </button>
                </div>
              </div>
              
              <div class="p-4 space-y-4">
                <!-- Sections -->
                <div 
                  v-for="(section, sectionIndex) in editingTemplate.sections" 
                  :key="sectionIndex" 
                  class="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <!-- Section Header -->
                  <div class="bg-blue-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                      <input 
                        v-model="section.name"
                        type="text"
                        placeholder="Section Name (e.g., Contact Info)"
                        class="bg-transparent border-none text-sm font-medium text-blue-900 focus:outline-none focus:ring-0 w-48"
                      />
                      <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {{ section.fields.length }} fields
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button 
                        @click="addFieldToSection(sectionIndex)"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Plus class="w-3 h-3" />
                        Add Field
                      </button>
                      <button 
                        @click="removeSection(sectionIndex)"
                        type="button"
                        class="text-red-600 hover:text-red-800 p-1"
                        title="Remove section"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <!-- Section Fields -->
                  <div class="p-4 space-y-3">
                    <div 
                      v-for="(field, fieldIndex) in section.fields" 
                      :key="fieldIndex" 
                      class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div class="w-32">
                        <select 
                          v-model="field.type"
                          class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="text">Text Input</option>
                          <option value="textarea">Text Area</option>
                          <option value="select">Dropdown</option>
                          <option value="file">File Upload</option>
                        </select>
                      </div>
                      
                      <div class="flex-1">
                        <input 
                          v-model="field.label"
                          placeholder="Field Label (e.g., Full Name, Email)"
                          class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div class="flex items-center gap-2">
                        <input 
                          v-model="field.required"
                          type="checkbox" 
                          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          :id="`required-${sectionIndex}-${fieldIndex}`"
                        />
                        <label :for="`required-${sectionIndex}-${fieldIndex}`" class="text-sm text-gray-700 whitespace-nowrap">
                          Required
                        </label>
                      </div>
                      
                      <button 
                        @click="removeFieldFromSection(sectionIndex, fieldIndex)"
                        type="button"
                        class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Remove field"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div 
                      v-if="section.fields.length === 0"
                      class="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
                    >
                      <p class="text-gray-500 text-sm">No fields in this section. Click "Add Field" to add fields.</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  v-if="editingTemplate.sections.length === 0"
                  class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
                >
                  <List class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p class="text-gray-500 text-sm">No sections added yet. Click "Add Section" to get started.</p>
                  <button 
                    @click="createDefaultTemplate"
                    type="button"
                    class="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Or create a default professional template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PREVIEW VIEW -->
        <div v-else-if="currentView === 'preview'" class="space-y-6">
          <!-- CV Preview Container -->
          <div class="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
            <!-- Preview Header -->
            <div class="bg-blue-50 border-b border-blue-200 p-4">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-lg font-semibold text-blue-900">Preview: {{ previewTemplateData?.name }}</h3>
                  <p class="text-sm text-blue-700 mt-1">{{ previewTemplateData?.description }}</p>
                </div>
                <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Live Preview</span>
              </div>
            </div>
            
            <!-- CV Content -->
            <div class="p-8">
              <!-- Example CV Layout -->
              <div class="max-w-4xl mx-auto bg-white">
                <!-- CV Header with Photo -->
                <div class="flex items-start gap-8 mb-10 pb-8 border-b border-gray-300">
                  <!-- Photo placeholder -->
                  <div class="w-36 h-48 border-2 border-gray-400 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div class="text-center p-4">
                      <svg class="w-14 h-14 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <p class="text-xs text-gray-600 font-medium">PROFILE PHOTO</p>
                      <p class="text-xs text-gray-500">4x6 Size</p>
                    </div>
                  </div>
                  
                  <!-- Name and Title -->
                  <div class="flex-1">
                    <h1 class="text-4xl font-bold text-gray-900 mb-2 uppercase tracking-tight">JULIANA SILVA</h1>
                    <div class="inline-block">
                      <h2 class="text-2xl text-blue-800 font-semibold mb-6 pb-2 border-b-2 border-blue-300">Art Director</h2>
                    </div>
                    
                    <!-- Contact Info -->
                    <div class="grid grid-cols-2 gap-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg class="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500 font-medium">PHONE</p>
                          <p class="text-sm text-gray-800 font-medium">+855 12 345 678</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg class="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500 font-medium">EMAIL</p>
                          <p class="text-sm text-gray-800 font-medium">juliana.silva@email.com</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg class="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500 font-medium">ADDRESS</p>
                          <p class="text-sm text-gray-800 font-medium">Phnom Penh, Cambodia</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg class="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"></path>
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500 font-medium">LINKEDIN</p>
                          <p class="text-sm text-gray-800 font-medium">linkedin.com/in/julianasilva</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Two Column Layout -->
                <div class="flex gap-10">
                  <!-- Left Column -->
                  <div class="w-2/5 space-y-8">
                    <!-- Education -->
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 mb-5 pb-2 border-b-2 border-gray-400 uppercase tracking-wider">Education</h3>
                      <div class="space-y-4">
                        <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                          <p class="font-bold text-gray-800 text-lg">Master of Arts</p>
                          <p class="text-gray-700 font-medium">Graphic Design</p>
                          <p class="text-gray-600 text-sm mt-1">Royal University of Phnom Penh</p>
                          <p class="text-gray-500 text-xs mt-2 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                            </svg>
                            Graduated: 2020
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Skills -->
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 mb-5 pb-2 border-b-2 border-gray-400 uppercase tracking-wider">Skills</h3>
                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <span class="text-gray-800 font-medium">Graphic Design</span>
                          <div class="flex gap-1">
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
                          </div>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-gray-800 font-medium">Team Management</span>
                          <div class="flex gap-1">
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                          </div>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-gray-800 font-medium">Adobe Creative Suite</span>
                          <div class="flex gap-1">
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
                            <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
                          </div>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-gray-800 font-medium">UI/UX Design</span>
                          <div class="flex gap-1">
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Languages -->
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 mb-5 pb-2 border-b-2 border-gray-400 uppercase tracking-wider">Languages</h3>
                      <div class="space-y-3">
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <span class="text-gray-800 font-medium">Khmer</span>
                          <span class="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Native</span>
                        </div>
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <span class="text-gray-800 font-medium">English</span>
                          <span class="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Fluent</span>
                        </div>
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <span class="text-gray-800 font-medium">Chinese</span>
                          <span class="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Basic</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Right Column -->
                  <div class="w-3/5 space-y-8">
                    <!-- About Me -->
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 mb-5 pb-2 border-b-2 border-gray-400 uppercase tracking-wider">About Me</h3>
                      <div class="bg-gray-50 p-5 rounded-lg">
                        <p class="text-gray-700 leading-relaxed">
                          Creative and results-driven Art Director with over 8 years of experience in digital design and brand strategy. 
                          Expert in leading cross-functional teams to deliver innovative visual solutions that enhance brand identity 
                          and drive business growth. Passionate about creating compelling visual narratives that resonate with target audiences.
                        </p>
                      </div>
                    </div>

                    <!-- Work Experience -->
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 mb-5 pb-2 border-b-2 border-gray-400 uppercase tracking-wider">Work Experience</h3>
                      
                      <!-- Experience 1 -->
                      <div class="mb-7 border-l-4 border-blue-500 pl-5">
                        <div class="flex justify-between items-start mb-3">
                          <h4 class="font-bold text-xl text-gray-800">Digital Marketing Manager</h4>
                          <span class="text-sm font-bold text-white bg-blue-600 px-3 py-1 rounded-full">Jan 2022 - Present</span>
                        </div>
                        <p class="text-gray-600 font-medium mb-3">Creative Solutions Inc. | Phnom Penh, Cambodia</p>
                        <ul class="list-disc pl-5 space-y-2 text-gray-700">
                          <li>Lead a team of 12 designers and content creators</li>
                          <li>Increased brand engagement by 45% through innovative campaigns</li>
                          <li>Managed $500K annual marketing budget with 25% ROI</li>
                          <li>Developed award-winning brand identity for 5 major clients</li>
                        </ul>
                      </div>

                      <!-- Experience 2 -->
                      <div class="mb-7 border-l-4 border-blue-400 pl-5">
                        <div class="flex justify-between items-start mb-3">
                          <h4 class="font-bold text-xl text-gray-800">Senior Graphic Designer</h4>
                          <span class="text-sm font-bold text-white bg-blue-500 px-3 py-1 rounded-full">2019 - 2021</span>
                        </div>
                        <p class="text-gray-600 font-medium mb-3">Brand Vision Agency | Phnom Penh, Cambodia</p>
                        <ul class="list-disc pl-5 space-y-2 text-gray-700">
                          <li>Designed visual identities for 30+ corporate clients</li>
                          <li>Mentored 5 junior designers in design principles</li>
                          <li>Won 3 national design awards for packaging design</li>
                        </ul>
                      </div>

                      <!-- Experience 3 -->
                      <div class="border-l-4 border-blue-300 pl-5">
                        <div class="flex justify-between items-start mb-3">
                          <h4 class="font-bold text-xl text-gray-800">Graphic Designer</h4>
                          <span class="text-sm font-bold text-white bg-blue-400 px-3 py-1 rounded-full">2017 - 2018</span>
                        </div>
                        <p class="text-gray-600 font-medium mb-3">Design Hub Studio | Phnom Penh, Cambodia</p>
                        <ul class="list-disc pl-5 space-y-2 text-gray-700">
                          <li>Created marketing materials for various campaigns</li>
                          <li>Assisted in website design and user interface projects</li>
                          <li>Managed social media graphics and content creation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Template Fields Preview -->
            <div class="border-t border-gray-300 p-6 bg-gray-50">
              <h3 class="text-lg font-semibold mb-4 text-gray-900">Template Fields Preview</h3>
              
              <div class="space-y-4">
                <div v-for="section in previewTemplateData?.sections" :key="section.id" class="border border-gray-200 rounded-lg overflow-hidden">
                  <div class="bg-gray-100 px-4 py-2 border-b border-gray-200">
                    <h4 class="font-medium text-gray-900">{{ section.name }}</h4>
                  </div>
                  <div class="p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div v-for="field in section.fields" :key="field.label" class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">
                          {{ field.label }}
                          <span v-if="field.required" class="text-red-500">*</span>
                        </label>
                        <input
                          :type="field.type === 'file' ? 'text' : field.type"
                          :placeholder="getFieldPlaceholder(field)"
                          class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- In the ASSIGN VIEW section of CVTemplateBuilder.vue -->
        <div v-else-if="currentView === 'assign'" class="space-y-4">
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 class="text-xl font-bold text-purple-900 mb-2">
              Assign Template: {{ assignTemplateData?.name }}
            </h3>
            <p class="text-purple-700 text-sm">
              Select which roles can use this CV template. <strong>Admin role is always included for testing.</strong>
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Additional Roles
              </label>
              <div class="space-y-2">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-blue-100 border border-blue-300 rounded flex items-center justify-center mr-2">
                    <Check class="w-3 h-3 text-blue-600" />
                  </div>
                  <span class="text-sm font-medium text-blue-700">Admin (Always included for testing)</span>
                </div>
                
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="role-teacher"
                    value="Teacher"
                    v-model="selectedRoles"
                    class="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label for="role-teacher" class="ml-2 text-sm text-gray-700">
                    Teacher
                  </label>
                </div>
                
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="role-staff"
                    value="Staff"
                    v-model="selectedRoles"
                    class="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label for="role-staff" class="ml-2 text-sm text-gray-700">
                    Staff
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Assignment Notes
              </label>
              <textarea
                v-model="assignmentNotes"
                rows="2"
                placeholder="E.g., This template is for testing purposes. All admins can use it."
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <!-- LIST VIEW FOOTER -->
        <button 
          v-if="currentView === 'list'"
          @click="$emit('close')"
          class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Close
        </button>

        <!-- EDIT VIEW FOOTER -->
        <template v-else-if="currentView === 'edit'">
          <button 
            @click="backToList"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            @click="saveTemplate"
            :disabled="!isTemplateValid"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ editingTemplate.id ? 'Update Template' : 'Create Template' }}
          </button>
        </template>

        <!-- PREVIEW VIEW FOOTER -->
        <template v-else-if="currentView === 'preview'">
          <button 
            @click="backToList"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back to List
          </button>
        </template>

        <!-- ASSIGN VIEW FOOTER -->
        <template v-else-if="currentView === 'assign'">
          <button 
            @click="backToList"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            @click="saveAssignment"
            :disabled="selectedTargets.length === 0"
            class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Confirm Assignment
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { X, Plus, FileText, List } from 'lucide-vue-next'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'template-saved'])

// State
const currentView = ref('list') // 'list', 'edit', 'preview', 'assign'
const editingTemplate = ref(null)
const previewTemplateData = ref(null)
const assignTemplateData = ref(null)

// DEBUG mode - set to false to hide debug info
const debugMode = ref(true)

// Assign view state
const mockTargetGroups = ref([
  { id: 1, name: 'Department: Mathematics' },
  { id: 2, name: 'Department: Languages' },
  { id: 3, name: 'Role: Teacher' },
  { id: 4, name: 'Role: Head of Department' },
  { id: 5, name: 'Role: Admin Staff' }
])
const selectedTargets = ref([])
const assignmentNotes = ref('')

// Template data - Will be loaded from localStorage
const templates = ref([])

// Load templates from localStorage on component mount
onMounted(() => {
  loadTemplatesFromStorage()
})

// Load templates from localStorage
const loadTemplatesFromStorage = () => {
  try {
    const savedTemplates = localStorage.getItem('cv-templates')
    if (savedTemplates) {
      const parsedTemplates = JSON.parse(savedTemplates)
      templates.value = parsedTemplates
      console.log('📂 Loaded templates from localStorage:', templates.value.length)
      console.log('Templates:', templates.value)
    } else {
      // If no saved templates, create default one
      templates.value = [
        {
          id: 1,
          name: "Professional CV Template",
          description: "Standard CV template with common sections",
          sections: [
            {
              id: 'header',
              name: 'Header',
              fields: [
                { type: "text", label: "Full Name", required: true, section: 'header' },
                { type: "text", label: "Job Title", required: true, section: 'header' },
                { type: "file", label: "Profile Photo", required: false, section: 'header' }
              ]
            },
            {
              id: 'contact',
              name: 'Contact Information',
              fields: [
                { type: "text", label: "Phone", required: true, section: 'contact' },
                { type: "text", label: "Email", required: true, section: 'contact' },
                { type: "text", label: "Address", required: false, section: 'contact' },
                { type: "text", label: "LinkedIn", required: false, section: 'contact' }
              ]
            },
            {
              id: 'summary',
              name: 'Professional Summary',
              fields: [
                { type: "textarea", label: "About Me", required: false, section: 'summary' }
              ]
            },
            {
              id: 'education',
              name: 'Education',
              fields: [
                { type: "text", label: "Highest Degree", required: true, section: 'education' },
                { type: "text", label: "Major/Field", required: true, section: 'education' },
                { type: "text", label: "University", required: true, section: 'education' },
                { type: "text", label: "Graduation Year", required: false, section: 'education' }
              ]
            },
            {
              id: 'experience',
              name: 'Work Experience',
              fields: [
                { type: "textarea", label: "Work Experience", required: true, section: 'experience' }
              ]
            },
            {
              id: 'skills',
              name: 'Skills',
              fields: [
                { type: "textarea", label: "Skills", required: false, section: 'skills' }
              ]
            },
            {
              id: 'languages',
              name: 'Languages',
              fields: [
                { type: "textarea", label: "Languages", required: false, section: 'languages' }
              ]
            }
          ]
        }
      ]
      saveTemplatesToStorage()
      console.log('📝 Created and saved default template')
    }
  } catch (error) {
    console.error('❌ Error loading templates from localStorage:', error)
    templates.value = []
  }
}

// Save templates to localStorage
const saveTemplatesToStorage = () => {
  try {
    localStorage.setItem('cv-templates', JSON.stringify(templates.value))
    console.log('💾 Saved templates to localStorage:', templates.value.length)
  } catch (error) {
    console.error('❌ Error saving templates to localStorage:', error)
  }
}

// Computed properties
const isTemplateValid = computed(() => {
  if (!editingTemplate.value) return false
  
  const hasName = editingTemplate.value.name?.trim()
  const hasSections = editingTemplate.value.sections?.length > 0
  const allSectionsValid = editingTemplate.value.sections?.every(section => 
    section.name?.trim() && section.fields?.length > 0
  )
  const allFieldsValid = editingTemplate.value.sections?.every(section =>
    section.fields?.every(field => field.label?.trim())
  )
  
  return hasName && hasSections && allSectionsValid && allFieldsValid
})

// Methods
const getModalTitle = () => {
  switch(currentView.value) {
    case 'edit': return 'CV Template Builder'
    case 'preview': return 'Preview Template'
    case 'assign': return 'Assign Template'
    default: return 'CV Template Builder'
  }
}

const getFieldPlaceholder = (field) => {
  const placeholders = {
    'Full Name': 'Enter your full name',
    'Job Title': 'Enter your job title',
    'Profile Photo': 'Upload 4x6 photo',
    'Phone': 'Enter phone number',
    'Email': 'Enter email address',
    'Address': 'Enter your address',
    'LinkedIn': 'Enter LinkedIn profile URL',
    'About Me': 'Write about yourself...',
    'Highest Degree': 'e.g., Bachelor of Arts',
    'Major/Field': 'e.g., Computer Science',
    'University': 'e.g., University Name',
    'Graduation Year': 'e.g., 2020',
    'Work Experience': 'Describe your work experience...',
    'Skills': 'List your skills...',
    'Languages': 'List languages you speak...'
  }
  
  return placeholders[field.label] || `Enter ${field.label.toLowerCase()}`
}

const closeModal = () => {
  if (currentView.value === 'list') {
    emit('close')
  } else {
    backToList()
  }
}

const backToList = () => {
  currentView.value = 'list'
  editingTemplate.value = null
  previewTemplateData.value = null
  assignTemplateData.value = null
  selectedTargets.value = []
  assignmentNotes.value = ''
}

const createDefaultTemplate = () => {
  if (!editingTemplate.value) return
  
  editingTemplate.value.sections = [
    {
      id: `section-${Date.now()}-1`,
      name: 'Header',
      fields: [
        { type: "text", label: "Full Name", required: true, section: 'header' },
        { type: "text", label: "Job Title", required: true, section: 'header' },
        { type: "file", label: "Profile Photo", required: false, section: 'header' }
      ]
    },
    {
      id: `section-${Date.now()}-2`,
      name: 'Contact Information',
      fields: [
        { type: "text", label: "Phone", required: true, section: 'contact' },
        { type: "text", label: "Email", required: true, section: 'contact' },
        { type: "text", label: "Address", required: false, section: 'contact' }
      ]
    }
  ]
  console.log('✅ Created default template structure')
}

const createNewTemplate = () => {
  editingTemplate.value = {
    id: null,
    name: "",
    description: "",
    sections: []
  }
  currentView.value = 'edit'
  console.log('🆕 Creating new template')
}

const addSection = () => {
  if (editingTemplate.value) {
    if (!editingTemplate.value.sections) {
      editingTemplate.value.sections = []
    }
    const sectionId = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    editingTemplate.value.sections.push({
      id: sectionId,
      name: `New Section ${editingTemplate.value.sections.length + 1}`,
      fields: []
    })
    console.log('➕ Added section, total:', editingTemplate.value.sections.length)
  }
}

const removeSection = (index) => {
  if (editingTemplate.value && editingTemplate.value.sections) {
    editingTemplate.value.sections.splice(index, 1)
    console.log('➖ Removed section, total:', editingTemplate.value.sections.length)
  }
}

const addFieldToSection = (sectionIndex) => {
  if (editingTemplate.value && editingTemplate.value.sections[sectionIndex]) {
    const section = editingTemplate.value.sections[sectionIndex]
    section.fields.push({
      type: "text",
      label: "",
      required: false,
      section: section.id
    })
    console.log('➕ Added field to section:', section.name)
  }
}

const removeFieldFromSection = (sectionIndex, fieldIndex) => {
  if (editingTemplate.value && editingTemplate.value.sections[sectionIndex]) {
    editingTemplate.value.sections[sectionIndex].fields.splice(fieldIndex, 1)
    console.log('➖ Removed field from section')
  }
}

// Generate unique ID for new templates
const generateUniqueId = () => {
  if (templates.value.length === 0) return 1
  const maxId = templates.value.reduce((max, template) => Math.max(max, template.id || 0), 0)
  return maxId + 1
}

const saveTemplate = async () => {
  console.log('💾 Saving template...')
  
  if (!editingTemplate.value.id) {
    // Create new template
    const newId = generateUniqueId()
    const newTemplate = {
      id: newId,
      name: editingTemplate.value.name.trim(),
      description: editingTemplate.value.description.trim(),
      sections: [...editingTemplate.value.sections.map(section => ({
        id: section.id,
        name: section.name.trim(),
        fields: section.fields.map(field => ({
          type: field.type,
          label: field.label.trim(),
          required: field.required,
          section: section.id
        }))
      }))]
    }
    
    console.log('✅ Creating new template:', newTemplate)
    
    // IMPORTANT: Create a new array to trigger Vue reactivity
    templates.value = [...templates.value, newTemplate]
    
    // Save to localStorage
    saveTemplatesToStorage()
    
    console.log('📋 Templates after adding:', templates.value.length)
    
    // Emit event
    emit('template-saved', newTemplate)
    
  } else {
    // Update existing template
    const index = templates.value.findIndex(t => t.id === editingTemplate.value.id)
    if (index !== -1) {
      const updatedTemplate = {
        id: editingTemplate.value.id,
        name: editingTemplate.value.name.trim(),
        description: editingTemplate.value.description.trim(),
        sections: [...editingTemplate.value.sections.map(section => ({
          id: section.id,
          name: section.name.trim(),
          fields: section.fields.map(field => ({
            type: field.type,
            label: field.label.trim(),
            required: field.required,
            section: section.id
          }))
        }))]
      }
      
      // Create new array with updated template
      const newTemplates = [...templates.value]
      newTemplates[index] = updatedTemplate
      templates.value = newTemplates
      
      // Save to localStorage
      saveTemplatesToStorage()
      
      console.log('✏️ Updated template:', updatedTemplate)
      
      // Emit event
      emit('template-saved', updatedTemplate)
    }
  }
  
  // Wait for next tick to ensure DOM updates
  await nextTick()
  
  // Go back to list view
  backToList()
  
  console.log('✅ Save completed. Templates count:', templates.value.length)
}

const editTemplate = (template) => {
  console.log('✏️ Editing template:', template.name)
  editingTemplate.value = {
    id: template.id,
    name: template.name,
    description: template.description,
    sections: template.sections.map(section => ({
      id: section.id,
      name: section.name,
      fields: section.fields.map(field => ({
        type: field.type,
        label: field.label,
        required: field.required,
        section: section.id
      }))
    }))
  }
  currentView.value = 'edit'
}

const previewTemplate = (template) => {
  console.log('👀 Preview template:', template.name)
  previewTemplateData.value = template
  currentView.value = 'preview'
}

const assignTemplate = (template) => {
  console.log('🎯 Assign template:', template.name)
  assignTemplateData.value = template
  selectedTargets.value = []
  assignmentNotes.value = ''
  currentView.value = 'assign'
}

const saveAssignment = () => {
  // Always include Admin role
  const rolesToAssign = ['Admin', ...selectedRoles.value]
  
  const assignment = { 
    template: assignTemplateData.value, 
    assignedTo: rolesToAssign, 
    notes: assignmentNotes.value 
  }
  
  console.log('Assignment saved:', assignment)
  
  // Update template with assignment
  const templateIndex = templates.value.findIndex(t => t.id === assignTemplateData.value.id)
  if (templateIndex !== -1) {
    templates.value[templateIndex].assignedTo = rolesToAssign
    saveTemplatesToStorage()
  }
  
  alert(`Template "${assignment.template.name}" assigned to ${rolesToAssign.join(', ')}!`)
  
  backToList()
}

// Add this method to the methods section
const deleteTemplate = (template) => {
  if (!confirm(`Are you sure you want to delete template "${template.name}"? This action cannot be undone.`)) {
    return
  }
  
  const index = templates.value.findIndex(t => t.id === template.id)
  if (index !== -1) {
    templates.value.splice(index, 1)
    saveTemplatesToStorage()
    console.log('🗑️ Template deleted:', template.name)
    
    // Show success message
    alert(`Template "${template.name}" has been deleted successfully.`)
  }
}

// Watch for template changes
watch(templates, (newTemplates) => {
  console.log('📋 Templates updated (watch triggered):', newTemplates.length)
}, { deep: true })

// Reset when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    currentView.value = 'list'
    console.log('🚀 Modal opened with templates:', templates.value.length)
  }
})
</script>

<style scoped>
/* Smooth transitions for modal */
.fixed {
  transition: opacity 0.2s ease-in-out;
}

/* Custom scrollbar for modal content */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Ensure the modal content area takes available space */
.flex-1 {
  flex: 1 1 0%;
}

/* Better button styling */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* CV Preview specific styles */
.cv-section-title {
  position: relative;
  padding-bottom: 8px;
}

.cv-section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: #3b82f6;
}

.skill-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #d1d5db;
}

.skill-dot.active {
  background-color: #3b82f6;
}
</style>